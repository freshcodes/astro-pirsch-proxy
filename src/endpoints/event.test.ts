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
  sendEvent: vi.fn(),
}))

vi.mock('../lib/logger.js', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
}))

import { GET, POST } from './event'
import { sendEvent } from '../lib/pirsch-client.js'
import { logError } from '../lib/logger.js'

const sendEventMock = vi.mocked(sendEvent)
const logErrorMock = vi.mocked(logError)

describe('event endpoint', () => {
  beforeEach(() => {
    sendEventMock.mockReset()
    sendEventMock.mockResolvedValue(undefined)
    logErrorMock.mockReset()
  })

  it('returns 204 for GET as no-op', async () => {
    const request = new Request('https://example.com/p/e', {
      method: 'GET',
    })

    const response = await GET({ request } as never)

    expect(response.status).toBe(204)
    expect(sendEventMock).not.toHaveBeenCalled()
  })

  it('returns 204 for POST and forwards event', async () => {
    const request = new Request('https://example.com/p/e', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ event_name: 'cta_click', url: '/pricing' }),
    })

    const response = await POST({
      request,
      clientAddress: '198.51.100.10',
    } as never)

    expect(response.status).toBe(204)
    expect(sendEventMock).toHaveBeenCalledTimes(1)
    expect(sendEventMock).toHaveBeenCalledWith(
      expect.any(Object),
      request,
      expect.objectContaining({ event_name: 'cta_click', url: '/pricing' }),
      '198.51.100.10',
    )
  })

  it('returns 204 for POST with invalid JSON and does not forward event', async () => {
    const request = new Request('https://example.com/p/e', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: '{invalid json',
    })

    const response = await POST({
      request,
      clientAddress: '198.51.100.10',
    } as never)

    expect(response.status).toBe(204)
    expect(sendEventMock).not.toHaveBeenCalled()
  })

  it('returns 204 when sendEvent rejects and logs error', async () => {
    const request = new Request('https://example.com/p/e', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ event_name: 'cta_click', url: '/pricing' }),
    })
    const rejection = new Error('send failed')
    sendEventMock.mockRejectedValue(rejection)

    const response = await POST({
      request,
      clientAddress: '198.51.100.10',
    } as never)

    await Promise.resolve()

    expect(response.status).toBe(204)
    expect(logErrorMock).toHaveBeenCalledWith('Error tracking event', rejection)
  })
})
