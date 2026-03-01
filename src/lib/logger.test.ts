import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('virtual:pirsch-config', () => ({
  default: {
    debug: false,
  },
}))

import config from 'virtual:pirsch-config'
import { logDebug, logError } from './logger'

describe('logger', () => {
  afterEach(() => {
    ;(config as { debug: boolean }).debug = false
    vi.restoreAllMocks()
  })

  it('does not log debug messages when debug is disabled', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    logDebug('debug message')

    expect(logSpy).not.toHaveBeenCalled()
  })

  it('logs debug messages when debug is enabled', () => {
    ;(config as { debug: boolean }).debug = true
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    logDebug('debug message')

    expect(logSpy).toHaveBeenCalledWith('[Pirsch Proxy]', 'debug message')
  })

  it('logs debug messages with attached data when debug is enabled', () => {
    ;(config as { debug: boolean }).debug = true
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    logDebug('debug message', { key: 'value' })

    expect(logSpy).toHaveBeenCalledWith('[Pirsch Proxy]', 'debug message', {
      key: 'value',
    })
  })

  it('logs errors through console.error', () => {
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    logError('test error')

    expect(errorSpy).toHaveBeenCalled()
  })

  it('logs error details for Error instances', () => {
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    const error = new Error('boom')
    ;(error as Error & { code: number; data: { error: string[] } }).code = 400
    ;(error as Error & { code: number; data: { error: string[] } }).data = {
      error: ['Missing required request parameters.'],
    }

    logError('test error', error)

    expect(errorSpy).toHaveBeenNthCalledWith(1, '[Pirsch Proxy]', 'test error')
    expect(errorSpy).toHaveBeenNthCalledWith(2, '[Pirsch Proxy]', error)
  })

  it('logs non-Error payloads when provided', () => {
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    logError('test error', { reason: 'invalid request' })

    expect(errorSpy).toHaveBeenNthCalledWith(1, '[Pirsch Proxy]', 'test error')
    expect(errorSpy).toHaveBeenNthCalledWith(2, '[Pirsch Proxy]', {
      reason: 'invalid request',
    })
  })
})
