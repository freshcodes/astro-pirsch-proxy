export interface PirschClient {
  id?: string
  secret: string
}

export interface EndpointNames {
  script?: string
  hit?: string
  event?: string
  session?: string
}

export interface PirschProxyConfig {
  clients: PirschClient[]
  routePrefix?: string
  endpointNames?: EndpointNames
  injectScript?: boolean
  scriptCacheTTL?: number
  timeout?: number
  debug?: boolean
  disableClientHints?: boolean
}

export interface ResolvedConfig extends Required<PirschProxyConfig> {
  endpointNames: Required<EndpointNames>
}

export interface CachedScript {
  content: Uint8Array
  expiresAt: number
}
