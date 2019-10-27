import App from './components/App'
import Backend from './backend/Backend'
import {Card} from './backend/Backend'
import CardsView from './components/CardsView'
import {initSynthesizer} from './speakL2'
import {Morpheme} from './backend/Backend'
import MorphemesView from './components/MorphemesView'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import speakL2 from './speakL2'

async function main() {
  const { protocol, host } = window.location
  const apiUrl = (host === 'localhost:3000') ?
    'http://localhost:8080/api' : `${protocol}//${host}/api`
  const backend = new Backend(apiUrl)
  backend.eventEmitter.on('cardsAndMorphemes', render)

  function render() {
    ReactDOM.render(<App
      backend={backend.props}
      initSynthesizer={initSynthesizer}
      speakL2={speakL2}
    />, document.getElementById('example'))
  }
  render()
}

main()