import { Client as PirschSDK } from 'pirsch-sdk'
import type { PirschHit, PirschEvent } from 'pirsch-sdk/types'
import type { PirschClient, ResolvedConfig } from '../types.js'
import { logError, logDebug } from './logger.js'

function appendServerData(
  clientData: Partial<PirschHit>,
  request: Request,
  clientIP: string,
): PirschHit {
  return {
    ...clientData,
    ip: clientIP,
    user_agent: request.headers.get('user-agent') || '',
    accept_language: request.headers.get('accept-language') || undefined,
    sec_ch_ua: request.headers.get('sec-ch-ua') || undefined,
    sec_ch_ua_mobile: request.headers.get('sec-ch-ua-mobile') || undefined,
    sec_ch_ua_platform: request.headers.get('sec-ch-ua-platform') || undefined,
    sec_ch_ua_platform_version:
      request.headers.get('sec-ch-ua-platform-version') || undefined,
    sec_ch_width: request.headers.get('sec-ch-width') || undefined,
    sec_ch_viewport_width:
      request.headers.get('sec-ch-viewport-width') || undefined,
  } as PirschHit
}

export async function sendHit(
  config: ResolvedConfig,
  request: Request,
  hitData: Partial<PirschHit>,
  clientIP: string,
): Promise<void> {
  const hit = appendServerData(hitData, request, clientIP)

  logDebug('[hit]', hit)

  const promises = config.clients.map(async (client, index) => {
    try {
      const pirsch = createPirschClient(client, config)
      await pirsch.hit(hit)
    } catch (error) {
      logError(`Failed to send hit to client ${index + 1}`, error)
      throw error
    }
  })

  await Promise.all(promises)
}

export async function sendEvent(
  config: ResolvedConfig,
  request: Request,
  eventData: Partial<PirschEvent>,
  clientIP: string,
): Promise<void> {
  const hit = appendServerData(eventData, request, clientIP)

  logDebug('[event]', {
    ...hit,
    ...eventData,
  })

  const promises = config.clients.map(async (client, index) => {
    try {
      const pirsch = createPirschClient(client, config)
      await pirsch.event(
        eventData.event_name || 'Unknown',
        hit,
        eventData.event_duration,
        eventData.event_meta,
      )
    } catch (error) {
      logError(`Failed to send event to client ${index + 1}`, error)
      throw error
    }
  })

  await Promise.all(promises)
}

export async function extendSession(
  config: ResolvedConfig,
  request: Request,
  clientIP: string,
): Promise<void> {
  const session = {
    ip: clientIP,
    user_agent: request.headers.get('user-agent') || '',
  }

  logDebug('[session]', session)

  const promises = config.clients.map(async (client, index) => {
    try {
      const pirsch = createPirschClient(client, config)
      await pirsch.session(session)
    } catch (error) {
      logError(`Failed to extend session for client ${index + 1}`, error)
      throw error
    }
  })

  await Promise.all(promises)
}

function createPirschClient(
  client: PirschClient,
  config: ResolvedConfig,
): InstanceType<typeof PirschSDK> {
  if (client.id) {
    return new PirschSDK({
      clientId: client.id,
      clientSecret: client.secret,
      hostname: 'api.pirsch.io',
      timeout: config.timeout,
    })
  } else {
    return new PirschSDK({
      accessToken: client.secret,
      hostname: 'api.pirsch.io',
      timeout: config.timeout,
    })
  }
}
