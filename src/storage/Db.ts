import {Card} from './CardsStorage'
import Dexie from 'dexie'
import {IndexedWordPairList} from './DictionaryStorage';
import {Morpheme} from './MorphemesStorage'
import {Upload} from './UploadsStorage'

const DB_NAME = 'language-learning-planner'

export default class Db extends Dexie {
  cards: Dexie.Table<Card, number>
  indexedWordPairLists: Dexie.Table<IndexedWordPairList, number>
  morphemes: Dexie.Table<Morpheme, number>
  uploads: Dexie.Table<Upload, number>

  constructor() {
    super(DB_NAME)
    this.version(1).stores({
      cards: '++id,l1,l2,createdAtMillis,updatedAtMillis',
      indexedWordPairLists: 'enPrefix,wordPairs',
      morphemes: '++id,l2,gloss,createdAtMillis,updatedAtMillis',
      uploads: '++id,type,logJson,createdAtMillis',
    })
  }
}