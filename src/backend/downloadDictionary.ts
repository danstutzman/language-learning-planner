import {WordPair} from '../storage/DictionaryStorage'

export default function downloadDictionary(
  apiUrl: string,
  clientVersion: string,
  log: (event: string, details?: {}) => void,
  timeoutMillis: number,
): Promise<Array<WordPair>> {
  return new Promise((resolve, reject) => {
    log('DownloadDictionaryStart')

    let timedOut = false
    const timeout = setTimeout(
      () => {
        timedOut = true
        log('DownloadDictionaryTimeout', { timeout: timeoutMillis })
        reject(new Error('TIMEOUT'))
      },
      timeoutMillis)

    fetch(apiUrl, {
      headers: { 'X-Client-Version': clientVersion },
    }).then(response => {
      if (!timedOut) {
        clearTimeout(timeout)
        const successPromise = handleResponse(response, log)
        resolve(successPromise)
      }
    }).catch(e => {
      clearTimeout(timeout)
      if (e.message === 'Failed to fetch') {
        log('DownloadDictionaryFailure', e)
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
): Promise<Array<WordPair>> {
  return response.text().then(text => {
    if (!response.ok) {
      log('DownloadDictionaryFailure', {
        status: response.status,
        text: response.text,
      })
      throw new Error('BAD_RESPONSE')
    }

    log('DownloadDictionarySuccess')

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
