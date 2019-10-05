import Db from './Db'
import * as EventEmitter from 'eventemitter3'

export interface WordPair {
  en: string
  es: string
}

export interface IndexedWordPairList {
  enPrefix: string
  wordPairs: Array<WordPair>
}

export interface DictionaryProps {
  cachedWordPairs: {[enPrefix: string]: Array<WordPair>}
  cacheLookupWordPairs: (query: string) => void
  lookupWordPairs: (query: string) => Array<WordPair> | null
  saveDictionary: (wordPairs: Array<WordPair>) => Promise<void>
  truncateQuery: (query: string) => string
}

function truncateQuery(query: string): string {
  const short = (query.length > 3) ? query.substr(0, 3) : query
  return short
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
}

export default class DictionaryStorage {
  eventEmitter: EventEmitter
  props: DictionaryProps
  db: Db

  constructor(db: Db) {
    this.eventEmitter = new EventEmitter()
    this.props = {
      cachedWordPairs: {},
      cacheLookupWordPairs: this.cacheLookupWordPairs,
      lookupWordPairs: this.lookupWordPairs,
      saveDictionary: this.saveDictionary,
      truncateQuery,
    }
    this.db = db
    this.eventEmitter.emit('dictionary')
  }

  cacheLookupWordPairs = (query: string) => {
    const enPrefix = truncateQuery(query)
    if (this.props.cachedWordPairs[enPrefix] === undefined) {
      this.db.indexedWordPairLists.get({ enPrefix }).then(list => {
        if (list !== undefined) {
          this.props = {
            ...this.props,
            cachedWordPairs: {
              ...this.props.cachedWordPairs,
              [enPrefix]: list.wordPairs,
            },
          }
          this.eventEmitter.emit('dictionary')
        }
      })
    }
  }

  lookupWordPairs = (query: string): Array<WordPair> | null => {
    const enPrefix = truncateQuery(query)
    const allWordPairs = this.props.cachedWordPairs[enPrefix]
    if (allWordPairs === undefined) { return null }

    const wordPairs: Array<WordPair> = []
    for (const wordPair of allWordPairs) {
      let containsQuery: boolean = wordPair.es.startsWith(query)
      for (const en of wordPair.en.split(', ')) {
        containsQuery = containsQuery || en.startsWith(query)
      }
      if (containsQuery) { wordPairs.push(wordPair) }
    }
    return wordPairs
  }

  saveDictionary = (allWordPairs: Array<WordPair>): Promise<void> => {
    const indexedWordPairListByEnPrefix:
      {[enPrefix: string]: IndexedWordPairList} = {}
    for (const wordPair of allWordPairs) {
      for (const enWord of wordPair.en.split(', ').concat([wordPair.es])) {
        const enPrefix = truncateQuery(enWord)
        if (indexedWordPairListByEnPrefix[enPrefix] === undefined) {
          indexedWordPairListByEnPrefix[enPrefix] = { enPrefix, wordPairs: [] }
        }

        const wordPairs = indexedWordPairListByEnPrefix[enPrefix].wordPairs
        if (!wordPairs.includes(wordPair)) {
          wordPairs.push(wordPair)
        }
      }
    }

    const lists: Array<IndexedWordPairList> =
      Object.values(indexedWordPairListByEnPrefix)
    if (lists.length > 0) {
      return this.db.indexedWordPairLists.clear()
        .then(() => this.db.indexedWordPairLists.bulkPut(lists))
        .then(() => {}) // satisfy type checker
    } else {
      return Promise.resolve()
    }
  }
}