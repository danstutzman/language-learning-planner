import App from './components/App'
import Backend from './backend/Backend'
import {Card} from './backend/Backend'
import CardsView from './components/CardsView'
import {Morpheme} from './backend/Backend'
import MorphemesView from './components/MorphemesView'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

async function main() {
  const { protocol, host } = window.location
  const apiUrl = (host === 'localhost:3000') ?
    'http://localhost:8080/api' : `${protocol}//${host}/api`
  const backend = new Backend(apiUrl)
  backend.eventEmitter.on('cardsAndMorphemes', render)

  function render() {
    ReactDOM.render(<App
      backend={backend.props}
    />, document.getElementById('example'))
  }
  render()
}

main()