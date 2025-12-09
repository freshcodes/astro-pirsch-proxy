import type { APIRoute } from 'astro'
import type { PirschEvent } from 'pirsch-sdk/types'
import config from 'virtual:pirsch-config'
import { sendEvent } from '../lib/pirsch-client.js'
import { logError } from '../lib/logger.js'

export const prerender = false

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const body = (await request.json()) as Partial<PirschEvent>

  // Fire and forget - don't wait for Pirsch API response
  sendEvent(config, request, body, clientAddress).catch((error) => {
    logError('Error tracking event', error)
  })

  return new Response(null, { status: 204 })
}
