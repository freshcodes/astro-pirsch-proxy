import type { MiddlewareHandler } from 'astro'

export const onRequest: MiddlewareHandler = async (_context, next) => {
  const response = await next()

  response.headers.set(
    'Accept-CH',
    'Sec-CH-UA, Sec-CH-UA-Mobile, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-Width, Sec-CH-Viewport-Width, Width, Viewport-Width',
  )

  return response
}
