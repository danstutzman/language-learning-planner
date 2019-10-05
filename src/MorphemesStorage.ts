import * as EventEmitter from 'eventemitter3'
import Db from './Db'

export interface Morpheme {
  id?: number
  l2: string
  createdAtMillis: number
  updatedAtMillis: number
}

export interface MorphemesProps {
  morphemeById: {[id: number]: Morpheme}
  createMorpheme: () => Promise<Morpheme>
  deleteMorpheme: (id: number) => Promise<void>
  updateMorpheme: (morpheme: Morpheme) => Promise<Morpheme>
}

export default class MorphemesStorage {
  eventEmitter: EventEmitter
  props: MorphemesProps
  db: Db

  constructor(db: Db) {
    this.eventEmitter = new EventEmitter()
    this.props = {
      createMorpheme: this.createMorpheme,
      deleteMorpheme: this.deleteMorpheme,
      morphemeById: {},
      updateMorpheme: this.updateMorpheme,
    }
    this.db = db

    const morphemeById: {[id: number]: Morpheme} = {}
    this.db.morphemes
      .each((morpheme: Morpheme) => morphemeById[morpheme.id] = morpheme)
      .then(() => {
  console.log('morphemeById', morphemeById)
        this.props = { ...this.props, morphemeById }
        this.eventEmitter.emit('morphemes')
      })
  }

  createMorpheme = async (): Promise<Morpheme> => {
    const createdAtMillis = new Date().getTime()
    const unsavedMorpheme: Morpheme =
      { l2: '', createdAtMillis, updatedAtMillis: createdAtMillis }
    const id: number = await this.db.morphemes.add(unsavedMorpheme)

    const savedMorpheme: Morpheme = { ...unsavedMorpheme, id }
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

  updateMorpheme = (unsavedMorpheme: Morpheme): Promise<Morpheme> => {
    const updatedAtMillis = new Date().getTime()
    const savedMorpheme = { ...unsavedMorpheme, updatedAtMillis }
    return this.db.morphemes.put(savedMorpheme).then(() => {
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
      this.props = { ...this.props, morphemeById }
      this.eventEmitter.emit('morphemes')
    })
}