import type { Scalar } from '@fresh.codes/astro-pirsch-proxy'

declare global {
  function pirsch(
    event: string,
    meta?: {
      duration?: number
      meta?: Record<string, Scalar>
    },
  ): void
}

export {}
