import type { APIRoute } from 'astro'
import type { PirschHit } from 'pirsch-sdk/types'
import config from 'virtual:pirsch-config'
import { sendHit } from '../lib/pirsch-client.js'
import { logDebug, logError } from '../lib/logger.js'

export const prerender = false

export const GET: APIRoute = ({ request, clientAddress }) => {
  const url = new URL(request.url)

  logDebug('[hit] URL params:', url.searchParams.toString())

  const tags: Record<string, string | number | boolean> = {}
  for (const [key, value] of url.searchParams.entries()) {
    if (key.startsWith('tag_')) {
      const tagName = key.substring(4) // Remove 'tag_' prefix
      tags[tagName] = value
    }
  }

  const hitData: Partial<PirschHit> = {
    url: url.searchParams.get('url') || '',
    title: url.searchParams.get('t') || undefined,
    referrer: url.searchParams.get('ref') || undefined,
    screen_width: url.searchParams.has('w')
      ? parseInt(url.searchParams.get('w')!, 10) || undefined
      : undefined,
    screen_height: url.searchParams.has('h')
      ? parseInt(url.searchParams.get('h')!, 10) || undefined
      : undefined,
    tags,
  }

  // Fire and forget - don't wait for Pirsch API response
  sendHit(config, request, hitData, clientAddress).catch((error) => {
    logError('Error tracking hit', error)
  })

  return new Response(null, { status: 204 })
}
