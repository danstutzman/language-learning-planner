import Dexie from 'dexie'
import {Morpheme} from './MorphemesStorage'
import {Card} from './CardsStorage'

const DB_NAME = 'language-learning-planner'

export default class Db extends Dexie {
  morphemes: Dexie.Table<Morpheme, number>
  cards: Dexie.Table<Card, number>

  constructor() {
    super(DB_NAME)
    this.version(1).stores({
      morphemes: "++id,l2,createdAtMillis,updatedAtMillis",
      cards: "++id,text,createdAtMillis,updatedAtMillis",
    })
  }
}