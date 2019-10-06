import {Card} from '../storage/CardsStorage'
import downloadDictionary from './downloadDictionary'
import * as EventEmitter from 'eventemitter3'
import {Morpheme} from '../storage/MorphemesStorage'
import sendQuery from './sendQuery'
import sync from './sync'
import {Upload} from '../storage/UploadsStorage'
import {WordPair} from '../storage/DictionaryStorage'

const FETCH_TIMEOUT_MILLIS = 5000

export interface BackendProps {
  createMorpheme: (morpheme: Morpheme) => Promise<Morpheme>,
  downloadDictionary: () => Promise<Array<WordPair>>
  guessMorphemes: (l2: string) => Promise<MorphemeList>
  listCards: () => Promise<CardList>
  listMorphemes: () => Promise<MorphemeList>
  showCard: (id: number) => Promise<Card>
  showMorpheme: (id: number) => Promise<Morpheme>
  sync: (uploads: Array<Upload>) => Promise<void>
  updateCard: (card: Card) => Promise<Card>,
  updateMorpheme: (morpheme: Morpheme) => Promise<Morpheme>,
}

export interface CardList {
  cards: Array<Card>
  countWithoutLimit: number
}

export interface MorphemeList {
  morphemes: Array<Morpheme>
  countWithoutLimit: number
}

export default class Backend {
  eventEmitter: EventEmitter
  baseUrl: string
  listCardsCache: {[query: string]: Promise<CardList>}
  listMorphemesCache: {[query: string]: Promise<MorphemeList>}
  log: (event: string, details?: {}) => void
  props: BackendProps
  showCardCache: {[id: number]: Promise<Card>}
  showMorphemeCache: {[id: number]: Promise<Morpheme>}

  constructor(
    baseUrl: string,
    log: (event: string, details?: {}) => void
  ) {
    this.eventEmitter = new EventEmitter()
    this.baseUrl = baseUrl
    this.listCardsCache = {}
    this.listMorphemesCache = {}
    this.log = log
    this.props = {
      createMorpheme: this.createMorpheme,
      downloadDictionary: this.downloadDictionary,
      guessMorphemes: this.guessMorphemes,
      listCards: this.listCards,
      listMorphemes: this.listMorphemes,
      showCard: this.showCard,
      showMorpheme: this.showMorpheme,
      sync: this.sync,
      updateCard: this.updateCard,
      updateMorpheme: this.updateMorpheme,
    }
    this.showCardCache = {}
    this.showMorphemeCache = {}
  }

  sync = (uploads: Array<Upload>): Promise<void> =>
    sync(uploads, `${this.baseUrl}/sync-cards`, '',
      this.log, FETCH_TIMEOUT_MILLIS)
      .then(success => this.eventEmitter.emit('sync', success))
      .then(() => {})

  downloadDictionary = (): Promise<Array<WordPair>> =>
    downloadDictionary(
      `${this.baseUrl}/download-dictionary`, '',
      this.log, FETCH_TIMEOUT_MILLIS)

  listCards = (): Promise<CardList> => {
    const query = '/cards'
    let listPromise = this.listCardsCache[query]
    if (listPromise !== undefined) {
      return listPromise
    }

    listPromise = Promise.resolve().then(() =>
      sendQuery('GET', `${this.baseUrl}/cards`, null,
        this.log, FETCH_TIMEOUT_MILLIS))
    this.listCardsCache[query] = listPromise

    listPromise.then(list => {
      for (const card of list.cards) {
        this.showCardCache[card.id] = Promise.resolve(card)
      }
    })

    return listPromise
  }

  listMorphemes = (): Promise<MorphemeList> => {
    const query = '/morphemes'
    let listPromise = this.listMorphemesCache[query] 
    if (listPromise !== undefined) {
      return listPromise
    }

    listPromise = Promise.resolve().then(() => 
      sendQuery('GET', `${this.baseUrl}/morphemes`, null,
        this.log, FETCH_TIMEOUT_MILLIS))
    this.listMorphemesCache[query] = listPromise

    listPromise.then(list => {
      for (const morpheme of list.morphemes) {
        this.showMorphemeCache[morpheme.id] = Promise.resolve(morpheme)
      }
    })
      
    return listPromise
  }

  showCard = (id: number): Promise<Card> => {
    let cardPromise = this.showCardCache[id]
    if (cardPromise !== undefined) {
      return cardPromise
    }

    cardPromise = Promise.resolve().then(() => 
      sendQuery('GET', `${this.baseUrl}/cards/${id}`, null,
        this.log, FETCH_TIMEOUT_MILLIS))
    this.showCardCache[id] = cardPromise

    return cardPromise
  }

  showMorpheme = (id: number): Promise<Morpheme> => {
    let morphemePromise = this.showMorphemeCache[id]
    if (morphemePromise !== undefined) {
      return morphemePromise
    }

    morphemePromise = Promise.resolve().then(() => 
      sendQuery('GET', `${this.baseUrl}/morphemes/${id}`, null,
        this.log, FETCH_TIMEOUT_MILLIS))
    this.showMorphemeCache[id] = morphemePromise

    return morphemePromise
  }

  updateCard = async (card: Card): Promise<Card> => {
    const promise = Promise.resolve().then(() => sendQuery(
        'PUT', `${this.baseUrl}/cards/${card.id}`, card,
        this.log, FETCH_TIMEOUT_MILLIS))
      .then(card => {
        this.eventEmitter.emit('cardsAndMorphemes')
        return card
      })

    this.listCardsCache = {}
    this.listMorphemesCache = {}
    this.showMorphemeCache = {}
    this.showCardCache = { [card.id]: promise }

    return promise
  }

  createMorpheme = (morpheme: Morpheme): Promise<Morpheme> => {
    return sendQuery('POST', `${this.baseUrl}/morphemes`, morpheme,
      this.log, FETCH_TIMEOUT_MILLIS)
  }

  updateMorpheme = (morpheme: Morpheme): Promise<Morpheme> => {
    const promise = sendQuery('PUT',
      `${this.baseUrl}/morphemes/${morpheme.id}`, morpheme,
      this.log, FETCH_TIMEOUT_MILLIS)

    this.listCardsCache = {}
    this.listMorphemesCache = {}
    this.showCardCache = {}
    this.showMorphemeCache = { [morpheme.id]: promise }

    return promise
  }

  guessMorphemes = (l2: string): Promise<MorphemeList> => {
    return sendQuery('GET',
      `${this.baseUrl}/morphemes?prefix=${encodeURIComponent(l2)}`,
      null, this.log, FETCH_TIMEOUT_MILLIS)
  }
}