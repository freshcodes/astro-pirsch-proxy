import type { APIRoute } from 'astro'
import type { PirschEvent } from 'pirsch-sdk/types'
import config from 'virtual:pirsch-config'
import { sendEvent } from '../lib/pirsch-client.js'
import { logDebug, logError } from '../lib/logger.js'

export const prerender = false

export const GET: APIRoute = () => {
  return new Response(null, { status: 204 })
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: Partial<PirschEvent>
  try {
    body = (await request.json()) as Partial<PirschEvent>
  } catch {
    logDebug('Dropped event request with invalid JSON')
    return new Response(null, { status: 204 })
  }

  // Fire and forget - don't wait for Pirsch API response
  sendEvent(config, request, body, clientAddress).catch((error) => {
    logError('Error tracking event', error)
  })

  return new Response(null, { status: 204 })
}
