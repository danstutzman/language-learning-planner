import * as EventEmitter from 'eventemitter3'
import Db from './Db'

export interface Morpheme {
  id?: number
  l2: string
  gloss: string
  createdAtMillis: number
  updatedAtMillis: number
}

export interface MorphemesProps {
  createMorpheme: () => Promise<Morpheme>
  deleteMorpheme: (id: number) => Promise<void>
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
      guessMorphemes: this.guessMorphemes,
      hasLoaded: false,
      morphemeById: {},
      updateMorpheme: this.updateMorpheme,
    }
    this.db = db

    const morphemeById: {[id: number]: Morpheme} = {}
    this.db.morphemes
      .each((morpheme: Morpheme) => morphemeById[morpheme.id] = morpheme)
      .then(() => {
        this.props = { ...this.props, morphemeById, hasLoaded: true }
        this.eventEmitter.emit('morphemes')
      })
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

  guessMorphemes = (l2: string): Promise<Array<Morpheme>> => {
    const guessedMorphemes = this.guessedMorphemesByL2[l2]
    if (guessedMorphemes) {
      return Promise.resolve(guessedMorphemes)
    }

    return this.db.morphemes.toArray()
      .then(allMorphemes => {
        const guessedMorphemes = []
        for (const word of l2.split(/[^a-zñáéíóúü]/i)) {
          for (const morpheme of allMorphemes) {
            if (morpheme.l2 === word) {
              guessedMorphemes.push(morpheme)
            }
          }
        }

        this.guessedMorphemesByL2[l2] = guessedMorphemes
        return guessedMorphemes
      })
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

  deleteMorpheme = (id: number): Promise<void> =>
    this.db.morphemes.delete(id).then(() => {
      var morphemeById = { ...this.props.morphemeById }
      delete morphemeById[id]
      this.guessedMorphemesByL2 = {} // clear cache
      this.props = { ...this.props, morphemeById }
      this.eventEmitter.emit('morphemes')
    })
}