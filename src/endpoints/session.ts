import type { APIRoute } from 'astro'
import config from 'virtual:pirsch-config'
import { extendSession } from '../lib/pirsch-client.js'
import { logError } from '../lib/logger.js'

export const prerender = false

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    await extendSession(config, request, clientAddress)

    return new Response(null, { status: 204 })
  } catch (error) {
    logError('Error extending session', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
