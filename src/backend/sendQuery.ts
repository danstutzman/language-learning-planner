
export default function sendQuery(
  method: string,
  apiUrl: string,
  body: {} | null,
  log: (event: string, details?: {}) => void,
  timeoutMillis: number,
): Promise<any> {
  return new Promise((resolve, reject) => {
    log('SyncStart')

    let timedOut = false
    const timeout = setTimeout(
      () => {
        timedOut = true
        log('SyncTimeout', { timeout: timeoutMillis })
        reject(new Error('TIMEOUT'))
      },
      timeoutMillis)

    fetch(apiUrl, {
      method,
      body: body ? JSON.stringify(body) : null,
    }).then(response => {
      if (!timedOut) {
        clearTimeout(timeout)
        const successPromise = handleResponse(response, log)
        resolve(successPromise)
      }
    }).catch(e => {
      clearTimeout(timeout)
      if (e.message === 'Failed to fetch') {
        log('SyncFailure', e)
        reject(new Error('BAD_RESPONSE'))
      } else {
        reject(e)
      }
    })
  })
}

function handleResponse(
  response: Response,
  log: (event: string, details?: {}) => void,
): Promise<any> {
  return response.text().then(text => {
    if (!response.ok) {
      log('SyncFailure', {
        status: response.status,
        text: response.text,
      })
      throw new Error('BAD_RESPONSE')
    }

    let parsed = undefined
    try {
      parsed = JSON.parse(text)
    } catch (e) {
      log('SyncFailure', { error: e })
      throw new Error('BAD_RESPONSE_JSON')
    }

    log('SyncSuccess')

    return parsed
  })
}