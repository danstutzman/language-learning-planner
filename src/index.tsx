import App from './components/App'
import {Card} from './storage/CardsStorage'
import {CardsProps} from './storage/CardsStorage'
import CardsStorage from './storage/CardsStorage'
import CardsView from './components/CardsView'
import Db from './storage/Db'
import {Morpheme} from './storage/MorphemesStorage'
import {MorphemesProps} from './storage/MorphemesStorage'
import MorphemesStorage from './storage/MorphemesStorage'
import MorphemesView from './components/MorphemesView'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

async function main() {
  const db = new Db()
  const wipeDb = function() {
    db.close()
    db.delete()
  }

  const morphemesStorage = new MorphemesStorage(db)
  morphemesStorage.eventEmitter.on('morphemes', render)
  const cardsStorage = new CardsStorage(db)
  cardsStorage.eventEmitter.on('cards', render)

  function render() {
    ReactDOM.render(<App
      morphemes={morphemesStorage.props}
      cards={cardsStorage.props}
      wipeDb={wipeDb}
    />, document.getElementById('example'))
  }
  render()
}

main()