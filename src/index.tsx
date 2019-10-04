import Db from './Db'
import { NotesView } from './components/NotesView'
import Note from './Db'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

async function main() {
  const db = new Db()
  await db.notes.add({name: "Josephine", age: 21})
  const notes = await db.notes.where("age").below(25).toArray()
  ReactDOM.render(
    <NotesView notes={notes} />,
    document.getElementById("example")
  )
}

main()