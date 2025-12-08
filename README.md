# @fresh.codes/astro-pirsch-proxy

An Astro integration that [proxies Pirsch Analytics](https://docs.pirsch.io/advanced/proxy) requests through your server.

Requires an adapter for server rendering such as [@astro/node](https://docs.astro.build/en/guides/integrations-guide/node/).

## Installation

```bash
npm install @fresh.codes/astro-pirsch-proxy
```

## Usage

Add the integration to your `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'
import { pirschProxy } from '@fresh.codes/astro-pirsch-proxy'

const { PIRSCH_ACCESS_TOKEN } = loadEnv(process.env.NODE_ENV, process.cwd(), '')

export default defineConfig({
  integrations: [
    pirschProxy({
      clients: [
        {
          secret: PIRSCH_ACCESS_TOKEN,
        },
      ],
    }),
  ],
})
```

Create a `.env` file with your Pirsch access token:

```bash
PIRSCH_ACCESS_TOKEN=your-pirsch-access-token
```

The integration will automatically:

- Inject the Pirsch tracking script
- Proxy all analytics requests through your server
- Set up Client Hints headers for better device detection

## Configuration

```javascript
pirschProxy({
  // Required: Array of Pirsch API credentials
  clients: [
    {
      id: 'optional-client-id', // OAuth client ID (optional)
      secret: 'your-access-token', // Access token or client secret
    },
  ],

  // Optional: Customize endpoint paths (default: '/p')
  routePrefix: '/analytics',

  // Optional: Customize endpoint names
  endpointNames: {
    script: 'script.js', // default: 'p.js'
    hit: 'hit', // default: 'h'
    event: 'event', // default: 'e'
    session: 'session', // default: 's'
  },

  // Optional: Disable automatic script injection (default: true)
  injectScript: false,

  // Optional: Disable Client Hints headers (default: false)
  disableClientHints: true,

  // Optional: Enable debug logging (default: false)
  debug: true,

  // Optional: Request timeout in ms (default: 5000)
  timeout: 10000,

  // Optional: Script cache TTL in ms (default: 600000)
  scriptCacheTTL: 300000,
})
```

## Manual Script Injection

If you want full control over the Pirsch script attributes, disable automatic injection and use the `PirschScript` component.

First, configure the integration:

```javascript
// astro.config.mjs
export default defineConfig({
  integrations: [
    pirschProxy({
      clients: [{ secret: 'token' }],
      injectScript: false, // Disable automatic injection
    }),
  ],
})
```

Then use the `PirschScript` component in your layout:

```astro
---
// src/layouts/Layout.astro
import PirschScript from '@fresh.codes/astro-pirsch-proxy/components/PirschScript.astro'
---

<html>
  <head>
    <PirschScript data-enable-sessions='true' data-interval-ms='60000' />
  </head>
  <body>
    <slot />
  </body>
</html>
```

The component automatically configures the script `src` and endpoint data attributes. You can pass any additional Pirsch script attributes as props.

## TypeScript Support

Add the following to your `src/env.d.ts`:

```typescript
/// <reference types="@fresh.codes/astro-pirsch-proxy/client" />
```

Add the following to your `src/global.d.ts`:

```typescript
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
```

## Publishing

```bash
# Update version (patch, minor, or major)
npm version patch

# Push code and tags
git push && git push --tags

# Publish to npm
npm publish --access public

# Create GitHub release
gh release create v$(node -p "require('./package.json').version") --generate-notes
```

## License

[MIT License](LICENSE)

Made by [Fresh Codes](https://fresh.codes).

Don't have Pirsch yet? [Sign up here](https://pirsch.io/ref/5kgY5GGg4m) (affiliate link).
