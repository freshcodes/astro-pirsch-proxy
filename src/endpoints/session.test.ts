import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('virtual:pirsch-config', () => ({
  default: {
    clients: [{ secret: 'test-secret' }],
    routePrefix: '/p',
    endpointNames: {
      script: 'p.js',
      hit: 'h',
      event: 'e',
      session: 's',
    },
    injectScript: true,
    scriptCacheTTL: 600000,
    timeout: 5000,
    debug: false,
    disableClientHints: false,
  },
}))

vi.mock('../lib/pirsch-client.js', () => ({
  extendSession: vi.fn(),
}))

vi.mock('../lib/logger.js', () => ({
  logError: vi.fn(),
}))

import { GET, POST } from './session'
import { extendSession } from '../lib/pirsch-client.js'
import { logError } from '../lib/logger.js'

const extendSessionMock = vi.mocked(extendSession)
const logErrorMock = vi.mocked(logError)

describe('session endpoint', () => {
  beforeEach(() => {
    extendSessionMock.mockReset()
    extendSessionMock.mockResolvedValue(undefined)
    logErrorMock.mockReset()
  })

  it('returns 204 for GET keepalive as no-op', async () => {
    const request = new Request('https://example.com/p/s', {
      method: 'GET',
    })

    const response = await GET({ request } as never)

    expect(response.status).toBe(204)
    expect(extendSessionMock).not.toHaveBeenCalled()
  })

  it('returns 204 for POST and forwards session extension', async () => {
    const request = new Request('https://example.com/p/s', {
      method: 'POST',
    })

    const response = await POST({
      request,
      clientAddress: '198.51.100.10',
    } as never)

    expect(response.status).toBe(204)
    expect(extendSessionMock).toHaveBeenCalledTimes(1)
    expect(extendSessionMock).toHaveBeenCalledWith(
      expect.any(Object),
      request,
      '198.51.100.10',
    )
  })

  it('returns 204 when extendSession rejects and logs error', async () => {
    const request = new Request('https://example.com/p/s', {
      method: 'POST',
    })
    const rejection = new Error('session failed')
    extendSessionMock.mockRejectedValue(rejection)

    const response = await POST({
      request,
      clientAddress: '198.51.100.10',
    } as never)

    await Promise.resolve()

    expect(response.status).toBe(204)
    expect(logErrorMock).toHaveBeenCalledWith(
      'Error extending session',
      rejection,
    )
  })
})
