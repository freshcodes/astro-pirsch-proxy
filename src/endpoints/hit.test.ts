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
  sendHit: vi.fn(),
}))

vi.mock('../lib/logger.js', () => ({
  logDebug: vi.fn(),
  logError: vi.fn(),
}))

import { GET } from './hit'
import { sendHit } from '../lib/pirsch-client.js'
import { logError } from '../lib/logger.js'

const sendHitMock = vi.mocked(sendHit)
const logErrorMock = vi.mocked(logError)

describe('hit endpoint', () => {
  beforeEach(() => {
    sendHitMock.mockReset()
    sendHitMock.mockResolvedValue(undefined)
    logErrorMock.mockReset()
  })

  it('returns 204 and forwards request without url', async () => {
    const request = new Request('https://example.com/p/h', {
      method: 'GET',
      headers: {
        'user-agent': 'test-agent',
      },
    })

    const response = await GET({
      request,
      clientAddress: '192.0.2.10',
    } as never)

    expect(response.status).toBe(204)
    expect(sendHitMock).toHaveBeenCalledTimes(1)
    expect(sendHitMock).toHaveBeenCalledWith(
      expect.any(Object),
      request,
      expect.objectContaining({ url: '' }),
      '192.0.2.10',
    )
  })

  it('returns 204 and forwards request with empty user-agent', async () => {
    const request = new Request('https://example.com/p/h?url=%2Fhome', {
      method: 'GET',
      headers: {
        'user-agent': '   ',
      },
    })

    const response = await GET({
      request,
      clientAddress: '192.0.2.20',
    } as never)

    expect(response.status).toBe(204)
    expect(sendHitMock).toHaveBeenCalledTimes(1)
  })

  it('sends hit with valid payload and clientAddress', async () => {
    const request = new Request('https://example.com/p/h?url=%2Fpricing', {
      method: 'GET',
      headers: {
        'user-agent': 'test-agent',
      },
    })

    const response = await GET({
      request,
      clientAddress: '203.0.113.42',
    } as never)

    expect(response.status).toBe(204)
    expect(sendHitMock).toHaveBeenCalledTimes(1)
    expect(sendHitMock).toHaveBeenCalledWith(
      expect.any(Object),
      request,
      expect.objectContaining({ url: '/pricing' }),
      '203.0.113.42',
    )
  })

  it('extracts tag_ query params into tags payload', async () => {
    const request = new Request(
      'https://example.com/p/h?url=%2Fpricing&tag_plan=pro&tag_trial=true&foo=bar',
      {
        method: 'GET',
      },
    )

    const response = await GET({
      request,
      clientAddress: '203.0.113.42',
    } as never)

    expect(response.status).toBe(204)
    expect(sendHitMock).toHaveBeenCalledWith(
      expect.any(Object),
      request,
      expect.objectContaining({
        tags: {
          plan: 'pro',
          trial: 'true',
        },
      }),
      '203.0.113.42',
    )
  })

  it('returns 204 when sendHit rejects and logs error', async () => {
    const request = new Request('https://example.com/p/h?url=%2Fpricing', {
      method: 'GET',
    })
    const rejection = new Error('send failed')
    sendHitMock.mockRejectedValue(rejection)

    const response = await GET({
      request,
      clientAddress: '203.0.113.42',
    } as never)

    await Promise.resolve()

    expect(response.status).toBe(204)
    expect(logErrorMock).toHaveBeenCalledWith('Error tracking hit', rejection)
  })

  it('parses screen dimensions and falls back to undefined for invalid values', async () => {
    const request = new Request(
      'https://example.com/p/h?url=%2Fpricing&w=1920&h=abc',
      {
        method: 'GET',
      },
    )

    const response = await GET({
      request,
      clientAddress: '203.0.113.42',
    } as never)

    expect(response.status).toBe(204)
    expect(sendHitMock).toHaveBeenCalledWith(
      expect.any(Object),
      request,
      expect.objectContaining({
        screen_width: 1920,
        screen_height: undefined,
      }),
      '203.0.113.42',
    )
  })

  it('falls back to undefined for invalid screen width values', async () => {
    const request = new Request(
      'https://example.com/p/h?url=%2Fpricing&w=abc&h=1080',
      {
        method: 'GET',
      },
    )

    const response = await GET({
      request,
      clientAddress: '203.0.113.42',
    } as never)

    expect(response.status).toBe(204)
    expect(sendHitMock).toHaveBeenCalledWith(
      expect.any(Object),
      request,
      expect.objectContaining({
        screen_width: undefined,
        screen_height: 1080,
      }),
      '203.0.113.42',
    )
  })
})
