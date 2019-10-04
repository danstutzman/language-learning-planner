import { Note } from '../NotesStorage'
import { NotesProps } from '../NotesStorage'
import './NotesView.css'
import * as React from 'react'

export interface NotesViewProps {
  history: any,
  notes: NotesProps
}

export default class NotesView extends React.PureComponent<NotesViewProps> {
  onClickNote = (e: any) => {
    const id = e.currentTarget.getAttribute('data-id')
    this.props.history.push(`/notes/${id}`)
  }

  onClickNewNote = () => {
    this.props.notes.createNote().then(note =>
      this.props.history.push(`/notes/${note.id}`)
    )
  }

  onClickDelete = (e: any) => {
    e.stopPropagation()
    const id: number = parseInt(e.target.getAttribute('data-id'), 10)
    this.props.notes.deleteNote(id)
  }

  render() {
    const notes: Array<Note> = Object.values(this.props.notes.noteById)
    return <div>
      <h2>Notes</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Text</th>
            <th>CreatedAt</th>
            <th>UpdatedAt</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {notes.map(note =>
            <tr
              key={note.id}
              className="darken-on-hover"
              onClick={this.onClickNote}
              data-id={note.id}>
              <td>{note.id}</td>
              <td>{note.text}</td>
              <td>{note.createdAtMillis}</td>
              <td>{note.updatedAtMillis}</td>
              <td>
                <button onClick={this.onClickDelete} data-id={note.id}>
                  Delete
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button onClick={this.onClickNewNote}>New Note</button>
    </div>
  }
}
