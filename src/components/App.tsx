import { HashRouter } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {Note} from '../NotesStorage'
import {NotesProps} from '../NotesStorage'
import NoteView from './NoteView'
import NotesView from './NotesView'
import * as React from 'react'
import { Route } from 'react-router-dom'

interface AppProps {
  notes: NotesProps
  wipeDb: () => void
}

export default class App extends React.PureComponent<AppProps> {
  onClickWipeDb = () => {
    this.props.wipeDb()
    window.alert('Database wiped.')
    window.location.reload()
  }

  renderNoteView = (args: any) => {
    const { notes } = this.props
    const id: string = args.match.params.id
    const note = notes.noteById[parseInt(id, 10)]
    const save = (note: Note) => notes.updateNote(note)
    return <NoteView
      close={args.history.goBack}
      note={note}
      save={save} />
  }

  renderNotesView = (args: any) =>
    <NotesView
      history={args.history}
      notes={this.props.notes} />

  render() {
    return <HashRouter>
      <div className="App">
        <Link to="/notes">Notes</Link>
        <br/>
        <button onClick={this.onClickWipeDb}>Wipe database</button>
        <br/>

        <Route path="/notes" exact render={this.renderNotesView} />
        <Route path="/notes/:id" render={this.renderNoteView} />
      </div>
    </HashRouter>
  }
}
