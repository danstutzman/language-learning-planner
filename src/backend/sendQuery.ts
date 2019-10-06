import {NetworkState} from './Backend'

export default function sendQuery(
  method: string,
  apiUrl: string,
  body: {} | null,
  log: (event: string, details?: {}) => void,
  timeoutMillis: number,
  updateNetworkState: (networkState: NetworkState) => void,
): Promise<any> {
  return new Promise((resolve, reject) => {
    log('SyncStart')
    updateNetworkState(NetworkState.WAITING)

    let timedOut = false
    const timeout = setTimeout(
      () => {
        timedOut = true
        log('SyncTimeout', { timeout: timeoutMillis })
        updateNetworkState(NetworkState.TIMEOUT)
        reject(new Error('TIMEOUT'))
      },
      timeoutMillis)

    fetch(apiUrl, {
      method,
      body: body ? JSON.stringify(body) : null,
    }).then(response => {
      if (!timedOut) {
        clearTimeout(timeout)
        const successPromise = handleResponse(response, log, updateNetworkState)
        resolve(successPromise)
      }
    }).catch(e => {
      clearTimeout(timeout)
      if (e.message === 'Failed to fetch') {
        log('SyncFailure', e)
        updateNetworkState(NetworkState.BAD_RESPONSE)
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
  updateNetworkState: (networkState: NetworkState) => void,
): Promise<any> {
  return response.text().then(text => {
    if (!response.ok) {
      log('SyncFailure', {
        status: response.status,
        text: response.text,
      })
      updateNetworkState(NetworkState.BAD_RESPONSE)
      throw new Error('BAD_RESPONSE')
    }

    let parsed = undefined
    try {
      parsed = JSON.parse(text)
    } catch (e) {
      log('SyncFailure', { error: e })
      updateNetworkState(NetworkState.BAD_RESPONSE_JSON)
      throw new Error('BAD_RESPONSE_JSON')
    }

    log('SyncSuccess')
    updateNetworkState(NetworkState.ASSUMED_OK)

    return parsed
  })
}