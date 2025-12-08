import { describe, it, expect, beforeEach } from 'vitest'
import { scriptCache } from './cache'

describe('ScriptCache', () => {
  beforeEach(() => {
    scriptCache.clear()
  })

  describe('get', () => {
    it('should return null when nothing cached', () => {
      const result = scriptCache.get()
      expect(result).toBeNull()
    })

    it('should return cached content', async () => {
      const content = new TextEncoder().encode('test content')
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(content)
          controller.close()
        },
      })

      await scriptCache.set(stream, 60000)
      const result = scriptCache.get()

      expect(result).toBeInstanceOf(Uint8Array)
      expect(new TextDecoder().decode(result!)).toBe('test content')
    })

    it('should return null for expired content', async () => {
      const content = new TextEncoder().encode('test content')
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(content)
          controller.close()
        },
      })

      // Set with very short TTL
      await scriptCache.set(stream, 1)

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 10))

      const result = scriptCache.get()
      expect(result).toBeNull()
    })
  })

  describe('set', () => {
    it('should store content from stream', async () => {
      const content = new TextEncoder().encode('hello world')
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(content)
          controller.close()
        },
      })

      const result = await scriptCache.set(stream, 60000)

      expect(result).toBeInstanceOf(Uint8Array)
      expect(new TextDecoder().decode(result)).toBe('hello world')
    })

    it('should store content from chunked stream', async () => {
      const chunks = [
        new TextEncoder().encode('hello '),
        new TextEncoder().encode('world'),
      ]

      const stream = new ReadableStream({
        start(controller) {
          chunks.forEach((chunk) => controller.enqueue(chunk))
          controller.close()
        },
      })

      const result = await scriptCache.set(stream, 60000)

      expect(new TextDecoder().decode(result)).toBe('hello world')
    })

    it('should make content retrievable via get', async () => {
      const content = new TextEncoder().encode('cached data')
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(content)
          controller.close()
        },
      })

      await scriptCache.set(stream, 60000)
      const result = scriptCache.get()

      expect(new TextDecoder().decode(result!)).toBe('cached data')
    })
  })

  describe('clear', () => {
    it('should remove cached content', async () => {
      const content = new TextEncoder().encode('test')
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(content)
          controller.close()
        },
      })

      await scriptCache.set(stream, 60000)

      scriptCache.clear()

      expect(scriptCache.get()).toBeNull()
    })
  })

  describe('TTL behavior', () => {
    it('should respect cache TTL', async () => {
      const content = new TextEncoder().encode('test')
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(content)
          controller.close()
        },
      })

      const ttl = 100
      await scriptCache.set(stream, ttl)

      // Should be available immediately
      expect(scriptCache.get()).not.toBeNull()

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, ttl + 50))

      // Should be expired
      expect(scriptCache.get()).toBeNull()
    })
  })
})
