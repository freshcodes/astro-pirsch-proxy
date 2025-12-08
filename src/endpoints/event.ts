import type { APIRoute } from 'astro'
import type { PirschEvent } from 'pirsch-sdk/types'
import config from 'virtual:pirsch-config'
import { sendEvent } from '../lib/pirsch-client.js'
import { logError } from '../lib/logger.js'

export const prerender = false

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const body = (await request.json()) as Partial<PirschEvent>
    await sendEvent(config, request, body, clientAddress)
    return new Response(null, { status: 204 })
  } catch (error) {
    logError('Error tracking event', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
