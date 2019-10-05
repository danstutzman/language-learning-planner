import * as EventEmitter from 'eventemitter3'
import Db from './Db'

export interface Card {
  id?: number
  l1: string
  l2: string
  morphemeIds: Array<number>,
  createdAtMillis: number
  updatedAtMillis: number
}

export interface CardsProps {
  cardById: {[id: number]: Card}
  createCard: () => Promise<Card>
  hasLoaded: boolean
  deleteCard: (id: number) => Promise<void>
  updateCard: (card: Card) => Promise<Card>
}

export default class CardsStorage {
  eventEmitter: EventEmitter
  props: CardsProps
  db: Db

  constructor(db: Db) {
    this.eventEmitter = new EventEmitter()
    this.props = {
      createCard: this.createCard,
      deleteCard: this.deleteCard,
      cardById: {},
      hasLoaded: false,
      updateCard: this.updateCard,
    }
    this.db = db

    const cardById: {[id: number]: Card} = {}
    this.db.cards.each((card: Card) => cardById[card.id] = card)
      .then(() => {
        this.props = { ...this.props, cardById, hasLoaded: true }
        this.eventEmitter.emit('cards')
      })
  }

  createCard = async (): Promise<Card> => {
    const createdAtMillis = new Date().getTime()
    const unsavedCard: Card = {
      l1: '',
      l2: '',
      morphemeIds: [],
      createdAtMillis,
      updatedAtMillis: createdAtMillis,
    }
    const id: number = await this.db.cards.add(unsavedCard)

    const savedCard: Card = { ...unsavedCard, id }
    this.props = {
      ...this.props,
      cardById: {
        ...this.props.cardById,
        [savedCard.id]: savedCard,
      },
    }
    this.eventEmitter.emit('cards')

    return savedCard
  }

  updateCard = async (unsavedCard: Card): Promise<Card> => {
    const updatedAtMillis = new Date().getTime()
    const savedCard = { ...unsavedCard, updatedAtMillis }

    await this.db.cards.put(savedCard)

    this.props = {
      ...this.props,
      cardById: {
        ...this.props.cardById,
        [savedCard.id]: savedCard,
      },
    }
    this.eventEmitter.emit('cards')

    return savedCard
  }

  updateCards = async (cards: Array<Card>): Promise<void> => {
    await this.db.cards.bulkPut(cards)

    const cardById = { ...this.props.cardById }
    for (const card of cards) {
      cardById[card.id] = card
    }
    this.props = { ...this.props, cardById }
    this.eventEmitter.emit('cards')
  }

  deleteCard = (id: number): Promise<void> =>
    this.db.cards.delete(id).then(() => {
      var cardById = { ...this.props.cardById }
      delete cardById[id]
      this.props = { ...this.props, cardById }
      this.eventEmitter.emit('cards')
    })
}