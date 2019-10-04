import Dexie from 'dexie'

export interface Note {
  id?: number
  name?: string
  age?: number
}

const DB_NAME = 'language-learning-planner'

export default class Db extends Dexie {
  notes: Dexie.Table<Note, number>

  constructor() {
    super(DB_NAME)
    this.version(1).stores({
      notes: "++id,name,age",
    })
  }
}