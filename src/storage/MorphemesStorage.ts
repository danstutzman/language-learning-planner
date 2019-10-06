import * as EventEmitter from 'eventemitter3'
import Db from './Db'
import { Morpheme } from './MorphemesStorage';

export interface Morpheme {
  id?: number
  l2: string
  gloss: string
  createdAtMillis?: number
  updatedAtMillis?: number
}

export interface MorphemesProps {
  createMorpheme: () => Promise<Morpheme>
  deleteMorpheme: (id: number) => Promise<void>
  findOrCreateMorphemes: (partialMorphemes: Array<Morpheme>) =>
    Promise<Array<Morpheme>>,
  guessMorphemes: (l2: string) => Promise<Array<Morpheme>>
  hasLoaded: boolean
  morphemeById: {[id: number]: Morpheme}
  updateMorpheme: (morpheme: Morpheme) => Promise<Morpheme>
}

export default class MorphemesStorage {
  eventEmitter: EventEmitter
  guessedMorphemesByL2: {[l2: string]: Array<Morpheme>}
  props: MorphemesProps
  db: Db

  constructor(db: Db) {
    this.eventEmitter = new EventEmitter()
    this.guessedMorphemesByL2 = {}
    this.props = {
      createMorpheme: this.createMorpheme,
      deleteMorpheme: this.deleteMorpheme,
      findOrCreateMorphemes: this.findOrCreateMorphemes,
      guessMorphemes: this.guessMorphemes,
      hasLoaded: false,
      morphemeById: {},
      updateMorpheme: this.updateMorpheme,
    }
    this.db = db

    // const morphemeById: {[id: number]: Morpheme} = {}
    // this.db.morphemes
    //   .each((morpheme: Morpheme) => morphemeById[morpheme.id] = morpheme)
    //   .then(() => {
    //     this.props = { ...this.props, morphemeById, hasLoaded: true }
    //     this.eventEmitter.emit('morphemes')
    //   })
  }

  findOrCreateMorphemes = async (partialMorphemes: Array<Morpheme>):
      Promise<Array<Morpheme>> => {
    const morphemes = []
    for (const partialMorpheme of partialMorphemes) {
      const { l2, gloss } = partialMorpheme
      if (l2 !== '' && gloss !== '') {
        const matches = (await this.db.morphemes.where({ l2 }).toArray())
          .filter(morpheme => morpheme.gloss === gloss)
        if (matches.length > 0) {
          morphemes.push(matches[0])
        } else {
          const createdAtMillis = new Date().getTime()
          const unsavedMorpheme: Morpheme = {
            l2,
            gloss,
            createdAtMillis,
            updatedAtMillis: createdAtMillis,
          }
          const id: number = await this.db.morphemes.add(unsavedMorpheme)
          const savedMorpheme: Morpheme = { ...unsavedMorpheme, id }
          morphemes.push(savedMorpheme)

          this.guessedMorphemesByL2 = {} // clear cache
          this.props = {
            ...this.props,
            morphemeById: {
              ...this.props.morphemeById,
              [savedMorpheme.id]: savedMorpheme,
            },
          }
          this.eventEmitter.emit('morphemes')
        }
      }
    }
    return morphemes
  }

  createMorpheme = async (): Promise<Morpheme> => {
    const createdAtMillis = new Date().getTime()
    const unsavedMorpheme: Morpheme = {
      l2: '',
      gloss: '',
      createdAtMillis,
      updatedAtMillis: createdAtMillis,
    }
    const id: number = await this.db.morphemes.add(unsavedMorpheme)

    const savedMorpheme: Morpheme = { ...unsavedMorpheme, id }
    this.guessedMorphemesByL2 = {} // clear cache
    this.props = {
      ...this.props,
      morphemeById: {
        ...this.props.morphemeById,
        [savedMorpheme.id]: savedMorpheme,
      },
    }
    this.eventEmitter.emit('morphemes')

    return savedMorpheme
  }

  guessMorphemes = async (l2: string): Promise<Array<Morpheme>> => {
    let guessedMorphemes: Array<Morpheme> = this.guessedMorphemesByL2[l2]
    if (guessedMorphemes) {
      return guessedMorphemes
    }

    const allMorphemes = await this.db.morphemes.toArray()
    guessedMorphemes = []
    const firstMatch = /[a-zñáéíóúü]+/i.exec(l2)
    if (firstMatch && firstMatch.length > 0) {
      for (const morpheme of allMorphemes) {
        if (morpheme.l2.startsWith(firstMatch[0])) {
          guessedMorphemes.push(morpheme)
        }
      }
    }

    this.guessedMorphemesByL2[l2] = guessedMorphemes
    return guessedMorphemes
  }

  updateMorpheme = (unsavedMorpheme: Morpheme): Promise<Morpheme> => {
    const updatedAtMillis = new Date().getTime()
    const savedMorpheme = { ...unsavedMorpheme, updatedAtMillis }
    return this.db.morphemes.put(savedMorpheme).then(() => {
      this.guessedMorphemesByL2 = {} // clear cache
      this.props = {
        ...this.props,
        morphemeById: {
          ...this.props.morphemeById,
          [savedMorpheme.id]: savedMorpheme,
        },
      }
      this.eventEmitter.emit('morphemes')

      return savedMorpheme
    })
  }

  updateMorphemes = async (morphemes: Array<Morpheme>): Promise<void> => {
    await this.db.morphemes.bulkPut(morphemes)

    this.guessedMorphemesByL2 = {} // clear cache
    const morphemeById: {[id: number]: Morpheme} = {}
    this.db.morphemes
      .each((morpheme: Morpheme) => morphemeById[morpheme.id] = morpheme)
      .then(() => {
        this.props = { ...this.props, morphemeById, hasLoaded: true }
        this.eventEmitter.emit('morphemes')
      })
  }

  deleteMorpheme = (id: number): Promise<void> =>
    this.db.morphemes.delete(id).then(() => {
      var morphemeById = { ...this.props.morphemeById }
      delete morphemeById[id]
      this.guessedMorphemesByL2 = {} // clear cache
      this.props = { ...this.props, morphemeById }
      this.eventEmitter.emit('morphemes')
    })
}