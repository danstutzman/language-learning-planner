import {Card} from '../storage/CardsStorage'
import downloadDictionary from './downloadDictionary'
import * as EventEmitter from 'eventemitter3'
import {Morpheme} from '../storage/MorphemesStorage'
import sendQuery from './sendQuery'
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
  listMorphemes: () => Promise<MorphemeList>
  showMorpheme: (id: number) => Promise<Morpheme>
  sync: (uploads: Array<Upload>) => Promise<void>
  networkState: NetworkState
}

export interface MorphemeList {
  morphemes: Array<Morpheme>
  countWithoutLimit: number
}

export default class Backend {
  eventEmitter: EventEmitter
  baseUrl: string
  clientVersion: string
  listMorphemesCache: {[query: string]: Promise<MorphemeList>}
  log: (event: string, details?: {}) => void
  props: BackendProps
  showMorphemeCache: {[id: number]: Promise<Morpheme>}

  constructor(
    baseUrl: string,
    clientVersion: string,
    log: (event: string, details?: {}) => void
  ) {
    this.eventEmitter = new EventEmitter()
    this.baseUrl = baseUrl
    this.clientVersion = clientVersion
    this.listMorphemesCache = {}
    this.log = log
    this.props = {
      downloadDictionary: this.downloadDictionary,
      listMorphemes: this.listMorphemes,
      showMorpheme: this.showMorpheme,
      sync: this.sync,
      networkState: NetworkState.ASSUMED_OK,
    }
    this.showMorphemeCache = {}
  }

  sync = (uploads: Array<Upload>): Promise<void> =>
    sync(uploads, `${this.baseUrl}/sync-cards`, this.clientVersion,
      this.log, FETCH_TIMEOUT_MILLIS, this.updateNetworkState)
      .then(success => this.eventEmitter.emit('sync', success))
      .then(() => {})

  downloadDictionary = (): Promise<Array<WordPair>> =>
    downloadDictionary(`${this.baseUrl}/download-dictionary`, this.clientVersion,
      this.log, FETCH_TIMEOUT_MILLIS, this.updateNetworkState)

  listMorphemes = async (): Promise<MorphemeList> => {
    const query = '/morphemes'
    let listPromise = this.listMorphemesCache[query] 
    if (listPromise !== undefined) {
      return listPromise
    }

    listPromise = Promise.resolve().then(() => 
      sendQuery(`${this.baseUrl}/morphemes`,
        this.clientVersion, this.log, FETCH_TIMEOUT_MILLIS,
        this.updateNetworkState))
    this.listMorphemesCache[query] = listPromise

    const list = await listPromise
    for (const morpheme of list.morphemes) {
      this.showMorphemeCache[morpheme.id] = Promise.resolve(morpheme)
    }
    return response
  }

  showMorpheme = async (id: number): Promise<Morpheme> => {
    let morphemePromise = this.showMorphemeCache[id]
    if (morphemePromise !== undefined) {
      return morphemePromise
    }

    morphemePromise = Promise.resolve().then(() => 
      sendQuery(`${this.baseUrl}/morphemes/${id}`,
        this.clientVersion, this.log, FETCH_TIMEOUT_MILLIS,
        this.updateNetworkState))
    this.showMorphemeCache[id] = morphemePromise

    return await morphemePromise
  }

  updateNetworkState = (networkState: NetworkState) => {
    this.props = { ...this.props, networkState }
    this.eventEmitter.emit('networkState')
  }
}