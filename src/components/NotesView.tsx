import { Note } from '../Db'
import * as React from "react"

export interface NotesViewProps {
  notes: Array<Note>
}

export class NotesView extends React.Component<NotesViewProps, {}> {
  render() {
    return <table>
      <thead>
        <tr>
          <th>id</th>
          <th>name</th>
          <th>age</th>
        </tr>
      </thead>
      <tbody>
        {this.props.notes.map((note: Note) => <tr key={note.id}>
          <td>{note.id}</td>
          <td>{note.name}</td>
          <td>{note.age}</td>
        </tr>)}
      </tbody>
    </table>
  }
}
