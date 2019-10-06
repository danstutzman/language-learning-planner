import {Card} from '../backend/Backend'
import * as EventEmitter from 'eventemitter3'
import sendQuery from './sendQuery'

export interface Morpheme {
  id?: number
  l2: string
  gloss: string
}

export const EMPTY_MORPHEME: Morpheme = {
  l2: '',
  gloss: '',
}

export interface Card {
  id?: number
  l1: string
  l2: string
  morphemes: Array<Morpheme>
}

export const EMPTY_MORPHEME_LIST: MorphemeList = {
  morphemes: [],
  countWithoutLimit: 0,
}

export interface BackendProps {
  createMorpheme: (morpheme: Morpheme) => Promise<Morpheme>,
  deleteMorpheme: (id: number) => Promise<void>,
  guessMorphemes: (l2: string) => Promise<MorphemeList>
  listCards: () => Promise<CardList>
  listMorphemes: () => Promise<MorphemeList>
  showCard: (id: number) => Promise<Card>
  showMorpheme: (id: number) => Promise<Morpheme>
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
  props: BackendProps
  showCardCache: {[id: number]: Promise<Card>}
  showMorphemeCache: {[id: number]: Promise<Morpheme>}

  constructor(baseUrl: string) {
    this.eventEmitter = new EventEmitter()
    this.baseUrl = baseUrl
    this.listCardsCache = {}
    this.listMorphemesCache = {}
    this.props = {
      createMorpheme: this.createMorpheme,
      deleteMorpheme: this.deleteMorpheme,
      guessMorphemes: this.guessMorphemes,
      listCards: this.listCards,
      listMorphemes: this.listMorphemes,
      showCard: this.showCard,
      showMorpheme: this.showMorpheme,
      updateCard: this.updateCard,
      updateMorpheme: this.updateMorpheme,
    }
    this.showCardCache = {}
    this.showMorphemeCache = {}
  }

  refresh = (promise: any): any => {
    this.props = { ...this.props } // so React notices change
    this.eventEmitter.emit('cardsAndMorphemes')
    return promise
  }

  listCards = (): Promise<CardList> => {
    const query = '/cards'
    let listPromise = this.listCardsCache[query]
    if (listPromise !== undefined) {
      return listPromise
    }

    listPromise = sendQuery('GET', `${this.baseUrl}/cards`, null)
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
      sendQuery('GET', `${this.baseUrl}/morphemes`, null))
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

    cardPromise = sendQuery('GET', `${this.baseUrl}/cards/${id}`, null)
    this.showCardCache[id] = cardPromise

    return cardPromise
  }

  showMorpheme = (id: number): Promise<Morpheme> => {
    let morphemePromise = this.showMorphemeCache[id]
    if (morphemePromise !== undefined) {
      return morphemePromise
    }

    morphemePromise =
      sendQuery('GET', `${this.baseUrl}/morphemes/${id}`, null)
    this.showMorphemeCache[id] = morphemePromise

    return morphemePromise
  }

  updateCard = async (card: Card): Promise<Card> => {
    const promise =
      sendQuery('PUT', `${this.baseUrl}/cards/${card.id}`, card)
        .then(this.refresh)

    this.listCardsCache = {}
    this.listMorphemesCache = {}
    this.showMorphemeCache = {}
    this.showCardCache = { [card.id]: promise }
    return promise.then(this.refresh)
  }

  createMorpheme = (morpheme: Morpheme): Promise<Morpheme> => {
    return sendQuery('POST', `${this.baseUrl}/morphemes`, morpheme)
      .then(this.refresh)
  }

  updateMorpheme = (morpheme: Morpheme): Promise<Morpheme> => {
    const promise = sendQuery('PUT',
      `${this.baseUrl}/morphemes/${morpheme.id}`, morpheme)

    this.listCardsCache = {}
    this.listMorphemesCache = {}
    this.showCardCache = {}
    this.showMorphemeCache = { [morpheme.id]: promise }
    return promise.then(this.refresh)
  }

  deleteMorpheme = (id: number): Promise<void> => {
    this.listCardsCache = {}
    this.listMorphemesCache = {}
    this.showCardCache = {}
    this.showMorphemeCache = {}

    const promise = sendQuery(
      'DELETE', `${this.baseUrl}/morphemes/${id}`, null)
    return promise.then(this.refresh)
  }

  guessMorphemes = (l2: string): Promise<MorphemeList> =>
    sendQuery('GET',
      `${this.baseUrl}/morphemes?prefix=${encodeURIComponent(l2)}`,
      null)
}