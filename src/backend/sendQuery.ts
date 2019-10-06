const TIMEOUT_MILLIS = 5000

export default function sendQuery(
  method: string,
  apiUrl: string,
  body: {} | null
): Promise<any> {
  return new Promise((resolve, reject) => {
    let timedOut = false
    const timeout = setTimeout(
      () => {
        timedOut = true
        console.log('SyncTimeout', { timeout: TIMEOUT_MILLIS })
        reject(new Error('TIMEOUT'))
      },
      TIMEOUT_MILLIS)

    fetch(apiUrl, {
      method,
      body: body ? JSON.stringify(body) : null,
    }).then(response => {
      if (!timedOut) {
        clearTimeout(timeout)
        const successPromise = handleResponse(response)
        resolve(successPromise)
      }
    }).catch(e => {
      clearTimeout(timeout)
      if (e.message === 'Failed to fetch') {
        console.error(e)
        reject(new Error('BAD_RESPONSE'))
      } else {
        reject(e)
      }
    })
  })
}

function handleResponse(response: Response): Promise<any> {
  return response.text().then(text => {
    if (!response.ok) {
      console.error('SyncFailure', {
        status: response.status,
        text: response.text,
      })
      throw new Error('BAD_RESPONSE')
    }

    let parsed = undefined
    try {
      parsed = JSON.parse(text)
    } catch (e) {
      console.error('SyncFailure', { error: e })
      throw new Error('BAD_RESPONSE_JSON')
    }

    return parsed
  })
}