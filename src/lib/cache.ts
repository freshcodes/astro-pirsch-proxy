import type { CachedScript } from '../types.js'

class ScriptCache {
  private cached: CachedScript | null = null

  get(): Uint8Array | null {
    if (!this.cached) {
      return null
    }

    if (Date.now() > this.cached.expiresAt) {
      this.cached = null
      return null
    }

    return this.cached.content
  }

  async set(
    stream: ReadableStream<Uint8Array>,
    ttl: number,
  ): Promise<Uint8Array> {
    const chunks: Uint8Array[] = []
    const reader = stream.getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
    } finally {
      reader.releaseLock()
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    const content = new Uint8Array(totalLength)
    let offset = 0

    for (const chunk of chunks) {
      content.set(chunk, offset)
      offset += chunk.length
    }

    this.cached = {
      content,
      expiresAt: Date.now() + ttl,
    }

    return content
  }

  clear(): void {
    this.cached = null
  }
}

export const scriptCache = new ScriptCache()
