import { HashRouter } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {Note} from '../NotesStorage'
import {NotesProps} from '../NotesStorage'
import NotesView from './NotesView'
import * as React from 'react'
import { Route } from 'react-router-dom'

interface AppProps {
  notes: NotesProps
}

export default class App extends React.PureComponent<AppProps> {
  renderNotesView = (args: any) =>
    <NotesView
      history={args.history}
      notes={this.props.notes} />

  render() {
    return <HashRouter>
      <div className="App">
        <Link to="/notes">Notes</Link>
        <br/>

        <Route path="/notes" exact render={this.renderNotesView} />
      </div>
    </HashRouter>
  }
}
