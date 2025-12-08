import config from 'virtual:pirsch-config'

const PREFIX = '[Pirsch Proxy]'

export function logError(message: string, error?: unknown): void {
  console.error(PREFIX, message)
  if (error instanceof Error) {
    console.error(PREFIX, error.message)
    if (error.stack) {
      console.error(error.stack)
    }
  } else if (error) {
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
