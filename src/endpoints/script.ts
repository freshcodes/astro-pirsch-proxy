import type { APIRoute } from 'astro'
import config from 'virtual:pirsch-config'
import { scriptCache } from '../lib/cache.js'
import { logError, logDebug } from '../lib/logger.js'

export const prerender = false

export const GET: APIRoute = async () => {
  try {
    const cached = scriptCache.get()

    if (cached) {
      logDebug('Serving cached script', { size: cached.length })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Uint8Array is valid for Response body but types differ between tsc and astro check
      return new Response(cached, {
        status: 200,
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': `public, max-age=${Math.floor(config.scriptCacheTTL / 1000)}`,
        },
      })
    }

    logDebug('Fetching script from Pirsch API')
    const scriptUrl = 'https://api.pirsch.io/pa.js'
    const response = await fetch(scriptUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch script: ${response.statusText}`)
    }

    if (!response.body) {
      throw new Error('No response body')
    }

    const content = await scriptCache.set(response.body, config.scriptCacheTTL)
    logDebug('Cached new script', { size: content.length })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Uint8Array is valid for Response body but types differ between tsc and astro check
    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': `public, max-age=${Math.floor(config.scriptCacheTTL / 1000)}`,
      },
    })
  } catch (error) {
    logError('Error serving script', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
