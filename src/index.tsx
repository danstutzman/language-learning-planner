import App from './components/App'
import Db from './Db'
import { Note } from './NotesStorage'
import { NotesProps } from './NotesStorage'
import NotesStorage from './NotesStorage'
import NotesView from './components/NotesView'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

async function main() {
  const db = new Db()
  const wipeDb = function() {
    db.close()
    db.delete()
  }

  const notesStorage = new NotesStorage(db)
  notesStorage.eventEmitter.on('notes', render)

  function render() {
    ReactDOM.render(<App
      notes={notesStorage.props}
      wipeDb={wipeDb}
    />, document.getElementById('example'))
  }
  render()
}

main()