import {Card} from '../storage/CardsStorage'
import {NetworkState} from './Backend'
import {Upload} from '../storage/UploadsStorage'

interface BackendCard {
  id: number
  created_at_millis: number
  updated_at_millis: number
  l1: string
  l2: string
  morpheme_ids_json: string
}

export interface SyncSuccess {
  cards: Array<Card>
  uploadIdsToDelete: Array<number>
}

function backendCardToCard(backendCard: BackendCard): Card {
  try {
    return {
      id: backendCard.id,
      l1: backendCard.l1,
      l2: backendCard.l2,
      morphemeIds: JSON.parse(backendCard.morpheme_ids_json),
      createdAtMillis: backendCard.created_at_millis,
      updatedAtMillis: backendCard.updated_at_millis,
    }
  } catch (e) {
    console.error('backendCard', backendCard)
    throw e
  }
}

export default function sync(
  uploads: Array<Upload>,
  apiUrl: string,
  clientVersion: string,
  log: (event: string, details?: {}) => void,
  timeoutMillis: number,
  updateNetworkState: (networkState: NetworkState) => void,
): Promise<SyncSuccess> {
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
      method: 'POST',
      body: JSON.stringify({ uploads }),
      headers: {
        'X-Client-Version': clientVersion,
      },
    }).then(response => {
      if (!timedOut) {
        clearTimeout(timeout)
        const uploadIdsToDelete: Array<number> =
          uploads.map(upload => upload.id)
        const successPromise = handleResponse(
          response, uploadIdsToDelete, log, updateNetworkState)
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
  uploadIdsToDelete: Array<number>,
  log: (event: string, details?: {}) => void,
  updateNetworkState: (networkState: NetworkState) => void,
): Promise<SyncSuccess> {
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
    const backendCards: Array<BackendCard> = parsed.cards
    const cards = backendCards.map(backendCardToCard)
    updateNetworkState(NetworkState.ASSUMED_OK)
    return { cards, uploadIdsToDelete }
  })
}