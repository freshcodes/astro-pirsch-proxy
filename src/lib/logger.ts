import config from 'virtual:pirsch-config'

const PREFIX = '[Pirsch Proxy]'

export function logError(message: string, error?: unknown): void {
  console.error(PREFIX, message)
  if (error !== undefined) {
    console.error(PREFIX, error)
  }
}

export function logDebug(message: string, data?: unknown): void {
  if (!config.debug) return

  if (data !== undefined) {
    console.log(PREFIX, message, data)
  } else {
    console.log(PREFIX, message)
  }
}
