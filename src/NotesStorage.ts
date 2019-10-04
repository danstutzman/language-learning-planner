import * as EventEmitter from 'eventemitter3'
import Db from './Db'

export interface Note {
  id?: number
  text: string
  createdAtMillis: number
  updatedAtMillis: number
}

export interface NotesProps {
  noteById: {[id: number]: Note}
  createNote: () => Promise<Note>
  deleteNote: (id: number) => Promise<void>
  updateNote: (note: Note) => Promise<Note>
}

export default class NotesStorage {
  eventEmitter: EventEmitter
  props: NotesProps
  db: Db

  constructor(db: Db) {
    this.eventEmitter = new EventEmitter()
    this.props = {
      createNote: this.createNote,
      deleteNote: this.deleteNote,
      noteById: {},
      updateNote: this.updateNote,
    }
    this.db = db

    const noteById: {[id: number]: Note} = {}
    this.db.notes.each((note: Note) => noteById[note.id] = note)
      .then(() => {
        this.props = { ...this.props, noteById }
        this.eventEmitter.emit('notes')
      })
  }

  createNote = async (): Promise<Note> => {
    const createdAtMillis = new Date().getTime()
    const unsavedNote: Note =
      { text: '', createdAtMillis, updatedAtMillis: createdAtMillis }
    const id: number = await this.db.notes.add(unsavedNote)

    const savedNote: Note = { ...unsavedNote, id }
    this.props = {
      ...this.props,
      noteById: {
        ...this.props.noteById,
        [savedNote.id]: savedNote,
      },
    }
    this.eventEmitter.emit('notes')

    return savedNote
  }

  updateNote = (unsavedNote: Note): Promise<Note> => {
    const updatedAtMillis = new Date().getTime()
    const savedNote = { ...unsavedNote, updatedAtMillis }
    return this.db.notes.put(savedNote).then(() => {
      this.props = {
        ...this.props,
        noteById: {
          ...this.props.noteById,
          [savedNote.id]: savedNote,
        },
      }
      this.eventEmitter.emit('notes')

      return savedNote
    })
  }

  deleteNote = (id: number): Promise<void> =>
    this.db.notes.delete(id).then(() => {
      var noteById = { ...this.props.noteById }
      delete noteById[id]
      this.props = { ...this.props, noteById }
      this.eventEmitter.emit('notes')
    })
}