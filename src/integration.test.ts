import { describe, it, expect } from 'vitest'
import { pirschProxy } from './integration'
import type { PirschProxyConfig } from './types'

describe('pirschProxy integration', () => {
  describe('configuration validation', () => {
    it('should throw error when no clients provided', () => {
      expect(() => {
        pirschProxy({ clients: [] })
      }).toThrow('[Pirsch Proxy] At least one client must be configured')
    })

    it('should throw error when client missing secret', () => {
      expect(() => {
        pirschProxy({ clients: [{ secret: '' }] } as PirschProxyConfig)
      }).toThrow('[Pirsch Proxy] Each client must have a secret')
    })

    it('should accept valid minimal config', () => {
      const integration = pirschProxy({
        clients: [{ secret: 'test-secret' }],
      })

      expect(integration.name).toBe('@fresh.codes/astro-pirsch-proxy')
      expect(integration.hooks).toBeDefined()
    })

    it('should accept valid config with client ID', () => {
      const integration = pirschProxy({
        clients: [{ id: 'test-id', secret: 'test-secret' }],
      })

      expect(integration.name).toBe('@fresh.codes/astro-pirsch-proxy')
    })

    it('should accept multiple clients', () => {
      const integration = pirschProxy({
        clients: [{ secret: 'secret-1' }, { secret: 'secret-2' }],
      })

      expect(integration.name).toBe('@fresh.codes/astro-pirsch-proxy')
    })
  })
})
