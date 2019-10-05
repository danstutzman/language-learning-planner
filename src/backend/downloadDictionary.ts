import {NetworkState} from './Backend'
import {WordPair} from '../storage/DictionaryStorage'

export default function downloadDictionary(
  apiUrl: string,
  clientVersion: string,
  log: (event: string, details?: {}) => void,
  timeoutMillis: number,
  updateNetworkState: (networkState: NetworkState) => void,
): Promise<Array<WordPair>> {
  return new Promise((resolve, reject) => {
    log('DownloadDictionaryStart')
    updateNetworkState(NetworkState.WAITING)

    let timedOut = false
    const timeout = setTimeout(
      () => {
        timedOut = true
        log('DownloadDictionaryTimeout', { timeout: timeoutMillis })
        updateNetworkState(NetworkState.TIMEOUT)
        reject(new Error('TIMEOUT'))
      },
      timeoutMillis)

    fetch(apiUrl, {
      headers: { 'X-Client-Version': clientVersion },
    }).then(response => {
      if (!timedOut) {
        clearTimeout(timeout)
        const successPromise = handleResponse(response, log, updateNetworkState)
        resolve(successPromise)
      }
    }).catch(e => {
      clearTimeout(timeout)
      if (e.message === 'Failed to fetch') {
        log('DownloadDictionaryFailure', e)
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
): Promise<Array<WordPair>> {
  return response.text().then(text => {
    if (!response.ok) {
      log('DownloadDictionaryFailure', {
        status: response.status,
        text: response.text,
      })
      updateNetworkState(NetworkState.BAD_RESPONSE)
      throw new Error('BAD_RESPONSE')
    }

    log('DownloadDictionarySuccess')
    updateNetworkState(NetworkState.ASSUMED_OK)

    const wordPairs = []
    const lines = text.split('\n')
    const headerRow = lines.shift()
    if (headerRow !== 'es\ten') {
      throw new Error(`Unexpected header row: ${headerRow}`)
    }
    for (const line of lines) {
      if (line !== '') {
        const values = line.split('\t')
        const es = values[0]
        const en = values[1]
        wordPairs.push({ en, es })
      }
    }
    return wordPairs
  })
}
