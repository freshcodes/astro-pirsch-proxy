import type { APIRoute } from 'astro'
import config from 'virtual:pirsch-config'
import { extendSession } from '../lib/pirsch-client.js'
import { logError } from '../lib/logger.js'

export const prerender = false

export const POST: APIRoute = ({ request, clientAddress }) => {
  // Fire and forget - don't wait for Pirsch API response
  extendSession(config, request, clientAddress).catch((error) => {
    logError('Error extending session', error)
  })

  return new Response(null, { status: 204 })
}
