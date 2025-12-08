import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'
import node from '@astrojs/node'
import { pirschProxy } from '@fresh.codes/astro-pirsch-proxy'

const { PIRSCH_ACCESS_TOKEN } = loadEnv(process.env.NODE_ENV, process.cwd(), '')

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  server: {
    allowedHosts: true,
  },
  integrations: [
    pirschProxy({
      clients: [
        {
          // Replace with your Pirsch credentials
          // For OAuth flow:
          // id: import.meta.env.PIRSCH_CLIENT_ID,
          // secret: import.meta.env.PIRSCH_CLIENT_SECRET,

          // For access token:
          secret: PIRSCH_ACCESS_TOKEN,
        },
      ],
      // Optional: customize route prefix (default is '/p')
      // routePrefix: '/__pirsch__',

      // Optional: customize endpoint names
      // endpointNames: {
      //   script: 'pa.js', // default is 'p.js'
      //   hit: 'hit', // default is 'h'
      //   event: 'event', // default is 'e'
      //   session: 'session' // default is 's'
      // },

      // Disable auto-inject to manually control script with tags and session tracking
      injectScript: false,

      // Optional: script cache TTL in milliseconds
      // scriptCacheTTL: 30000,

      // Optional: API request timeout in milliseconds
      // timeout: 5000,

      // Optional: enable debug logging
      debug: true,
    }),
  ],
})
