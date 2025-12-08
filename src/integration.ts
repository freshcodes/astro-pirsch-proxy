import type { AstroIntegration } from 'astro'
import type { PirschProxyConfig, ResolvedConfig } from './types.js'

const PACKAGE_NAME = '@fresh.codes/astro-pirsch-proxy'

export function pirschProxy(userConfig: PirschProxyConfig): AstroIntegration {
  const config = resolveConfig(userConfig)

  return {
    name: PACKAGE_NAME,
    hooks: {
      'astro:config:setup': ({
        injectRoute,
        injectScript,
        updateConfig,
        addMiddleware,
      }) => {
        const scriptPath = `${config.routePrefix}/${config.endpointNames.script}`
        const hitPath = `${config.routePrefix}/${config.endpointNames.hit}`
        const eventPath = `${config.routePrefix}/${config.endpointNames.event}`
        const sessionPath = `${config.routePrefix}/${config.endpointNames.session}`

        updateConfig({
          vite: {
            plugins: [
              {
                name: 'pirsch-proxy-config',
                resolveId(id) {
                  if (id === 'virtual:pirsch-config') {
                    return '\0virtual:pirsch-config'
                  }
                  return null
                },
                load(id) {
                  if (id === '\0virtual:pirsch-config') {
                    return `export default ${JSON.stringify(config)};`
                  }
                  return null
                },
              },
            ],
            ssr: {
              noExternal: [PACKAGE_NAME],
            },
          },
        })

        injectRoute({
          pattern: scriptPath,
          entrypoint: `${PACKAGE_NAME}/endpoints/script.js`,
        })

        injectRoute({
          pattern: hitPath,
          entrypoint: `${PACKAGE_NAME}/endpoints/hit.js`,
        })

        injectRoute({
          pattern: eventPath,
          entrypoint: `${PACKAGE_NAME}/endpoints/event.js`,
        })

        injectRoute({
          pattern: sessionPath,
          entrypoint: `${PACKAGE_NAME}/endpoints/session.js`,
        })

        if (config.injectScript) {
          injectScript(
            'head-inline',
            `(function() {
  const s = document.createElement('script');
  s.defer = true;
  s.src = '${scriptPath}';
  s.id = 'pianjs';
  s.setAttribute('data-hit-endpoint', '${hitPath}');
  s.setAttribute('data-event-endpoint', '${eventPath}');
  s.setAttribute('data-session-endpoint', '${sessionPath}');
  document.head.appendChild(s);
})();`,
          )
        }

        if (!config.disableClientHints) {
          addMiddleware({
            entrypoint: `${PACKAGE_NAME}/middleware/client-hints.js`,
            order: 'pre',
          })
        }
      },
    },
  }
}

function resolveConfig(userConfig: PirschProxyConfig): ResolvedConfig {
  if (!userConfig.clients || userConfig.clients.length === 0) {
    throw new Error('[Pirsch Proxy] At least one client must be configured')
  }

  for (const client of userConfig.clients) {
    if (!client.secret) {
      throw new Error('[Pirsch Proxy] Each client must have a secret')
    }
  }

  const resolved = {
    clients: userConfig.clients,
    routePrefix: userConfig.routePrefix || '/p',
    endpointNames: {
      script: userConfig.endpointNames?.script || 'p.js',
      hit: userConfig.endpointNames?.hit || 'h',
      event: userConfig.endpointNames?.event || 'e',
      session: userConfig.endpointNames?.session || 's',
    },
    injectScript: userConfig.injectScript ?? true,
    scriptCacheTTL: userConfig.scriptCacheTTL || 600_000,
    timeout: userConfig.timeout || 5_000,
    debug: userConfig.debug ?? false,
    disableClientHints: userConfig.disableClientHints ?? false,
  }

  if (resolved.debug) {
    console.log(
      '[Pirsch Proxy] Configuration:',
      JSON.stringify(resolved, null, 2),
    )
  }

  return resolved
}
