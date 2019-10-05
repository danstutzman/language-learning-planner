import Dexie from 'dexie'
import {Morpheme} from './MorphemesStorage'
import {Note} from './NotesStorage'

const DB_NAME = 'language-learning-planner'

export default class Db extends Dexie {
  morphemes: Dexie.Table<Morpheme, number>
  notes: Dexie.Table<Note, number>

  constructor() {
    super(DB_NAME)
    this.version(1).stores({
      morphemes: "++id,l2,createdAtMillis,updatedAtMillis",
      notes: "++id,text,createdAtMillis,updatedAtMillis",
    })
  }
}