import {Card} from '../storage/CardsStorage'
import downloadDictionary from './downloadDictionary'
import * as EventEmitter from 'eventemitter3'
import sync from './sync'
import {Upload} from '../storage/UploadsStorage'
import {WordPair} from '../storage/DictionaryStorage'

const FETCH_TIMEOUT_MILLIS = 5000

export enum NetworkState {
  ASSUMED_OK = 'ASSUMED_OK',
  WAITING = 'WAITING',
  TIMEOUT = 'TIMEOUT',
  BAD_RESPONSE = 'BAD_RESPONSE',
  BAD_RESPONSE_JSON = 'BAD_RESPONSE_JSON',
}

export interface BackendProps {
  downloadDictionary: () => Promise<Array<WordPair>>
  sync: (uploads: Array<Upload>) => Promise<void>
  networkState: NetworkState
}

export default class Backend {
  eventEmitter: EventEmitter
  baseUrl: string
  clientVersion: string
  log: (event: string, details?: {}) => void
  props: BackendProps

  constructor(
    baseUrl: string,
    clientVersion: string,
    log: (event: string, details?: {}) => void
  ) {
    this.eventEmitter = new EventEmitter()
    this.baseUrl = baseUrl
    this.clientVersion = clientVersion
    this.log = log
    this.props = {
      downloadDictionary: this.downloadDictionary,
      sync: this.sync,
      networkState: NetworkState.ASSUMED_OK,
    }
  }

  sync = (uploads: Array<Upload>): Promise<void> =>
    sync(uploads, `${this.baseUrl}/sync-cards`, this.clientVersion,
      this.log, FETCH_TIMEOUT_MILLIS, this.updateNetworkState)
      .then(success => this.eventEmitter.emit('sync', success))
      .then(() => {})

  downloadDictionary = (): Promise<Array<WordPair>> =>
    downloadDictionary(`${this.baseUrl}/download-dictionary`, this.clientVersion,
      this.log, FETCH_TIMEOUT_MILLIS, this.updateNetworkState)

  updateNetworkState = (networkState: NetworkState) => {
    this.props = { ...this.props, networkState }
    this.eventEmitter.emit('networkState')
  }
}