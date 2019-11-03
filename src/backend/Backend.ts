import {Card} from '../backend/Backend'
import * as EventEmitter from 'eventemitter3'
import sendQuery from './sendQuery'

export interface Morpheme {
  id?: number
  type: string
  l2: string
  nonsensePhones: string
  nonsenseL2: string
}

export const EMPTY_MORPHEME: Morpheme = {
  type: '',
  l2: '',
  nonsensePhones: '',
  nonsenseL2: '',
}

export interface Card {
  id?: number
  l1: string
  l2: string
  mnemonic12: string | null
  mnemonic21: string | null
  morphemes: Array<Morpheme>
}

export const EMPTY_CARD: Card = {
  l1: '',
  l2: '',
  mnemonic12: null,
  mnemonic21: null,
  morphemes: [],
}

export const EMPTY_MORPHEME_LIST: MorphemeList = {
  morphemes: [],
  countWithoutLimit: 0,
}

export interface AnswerMorpheme {
  correctL2: string
  alignedL2: string
}

export interface Answer {
  id?: number
  type: string
  cardId: number
  card?: Card
  morphemes?: Array<AnswerMorpheme>

  shownAt: Date
  answeredL1: string | null
  answeredL2: string | null
  showedMnemonic: boolean
  firstKeyMillis: number
  lastKeyMillis: number
}

export interface AnswerUpdate {
  id: number
  cardId: number
  answeredL1?: string
  answeredL2?: string
  showedMnemonic?: boolean
  shownAt?: Date
  firstKeyMillis?: number
  lastKeyMillis?: number
}

export interface BackendProps {
  createAnswer: (answer: Answer) => Promise<Answer>
  createCard: (card: Card) => Promise<Card>
  createMorpheme: (morpheme: Morpheme) => Promise<Morpheme>
  deleteCard: (id: number) => Promise<void>
  deleteMorpheme: (id: number) => Promise<void>
  getTopCards: (type: string) => Promise<CardList>
  guessMorphemes: (l2Prefix: string) => Promise<MorphemeList>
  listAnswers: () => Promise<AnswerList>
  listCards: () => Promise<CardList>
  listMorphemes: () => Promise<MorphemeList>
  parseL2Phrase: (l2Phrase: string) => Promise<MorphemeList>
  showCard: (id: number) => Promise<Card>
  showMorpheme: (id: number) => Promise<Morpheme>
  updateAnswer: (update: AnswerUpdate) => Promise<void>,
  updateCard: (card: Card) => Promise<Card>,
  updateMorpheme: (morpheme: Morpheme) => Promise<Morpheme>
}

export interface AnswerList {
  answers: Array<Answer>
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
      createAnswer: this.createAnswer,
      createCard: this.createCard,
      createMorpheme: this.createMorpheme,
      deleteCard: this.deleteCard,
      deleteMorpheme: this.deleteMorpheme,
      getTopCards: this.getTopCards,
      guessMorphemes: this.guessMorphemes,
      listCards: this.listCards,
      listAnswers: this.listAnswers,
      listMorphemes: this.listMorphemes,
      parseL2Phrase: this.parseL2Phrase,
      showCard: this.showCard,
      showMorpheme: this.showMorpheme,
      updateAnswer: this.updateAnswer,
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

  createCard = (card: Card): Promise<Card> => {
    const promise = sendQuery('POST', `${this.baseUrl}/cards`, card)
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

  deleteCard = (id: number): Promise<void> => {
    this.listCardsCache = {}
    this.listMorphemesCache = {}
    this.showCardCache = {}
    this.showMorphemeCache = {}

    const promise = sendQuery(
      'DELETE', `${this.baseUrl}/cards/${id}`, null)
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

  guessMorphemes = (l2Prefix: string): Promise<MorphemeList> =>
    sendQuery('GET', `${this.baseUrl}/morphemes` +
      `?l2_prefix=${encodeURIComponent(l2Prefix)}`, null)

  parseL2Phrase = (l2Phrase: string): Promise<MorphemeList> =>
    sendQuery('GET', `${this.baseUrl}/morphemes` +
      `?l2_phrase=${encodeURIComponent(l2Phrase)}`, null)

  getTopCards = (type: string): Promise<CardList> =>
    sendQuery('GET', `${this.baseUrl}/cards/top?` +
      `type=${type}`, null)

  updateAnswer = (update: AnswerUpdate): Promise<void> =>
    sendQuery('PATCH',
      `${this.baseUrl}/answers/${update.id}`, update)

  listAnswers = (): Promise<AnswerList> =>
    sendQuery('GET', `${this.baseUrl}/answers`, null)
    
  createAnswer = (answer: Answer): Promise<Answer> =>
    sendQuery('POST', `${this.baseUrl}/answers`, answer)
}