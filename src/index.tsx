import App from './components/App'
import Backend from './backend/Backend'
import {Card} from './storage/CardsStorage'
import {CardsProps} from './storage/CardsStorage'
import CardsStorage from './storage/CardsStorage'
import CardsView from './components/CardsView'
import Db from './storage/Db'
import DictionaryStorage from './storage/DictionaryStorage'
import {Morpheme} from './storage/MorphemesStorage'
import {MorphemesProps} from './storage/MorphemesStorage'
import MorphemesStorage from './storage/MorphemesStorage'
import MorphemesView from './components/MorphemesView'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import UploadsStorage from './storage/UploadsStorage'

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
  const dictionaryStorage = new DictionaryStorage(db)
  dictionaryStorage.eventEmitter.on('dictionary', render)
  const uploadsStorage = new UploadsStorage(db)

  const match = /main\.([0-9a-f]+)\.js/.exec(new Error().stack.split('\n')[0])
  const clientVersion = match ? match[1] : 'unknown'

  const { protocol, host } = window.location
  const apiUrl = (host === 'localhost:3000') ?
    'http://localhost:8080/api' : `${protocol}//${host}/api`
  const backend = new Backend(apiUrl, clientVersion, uploadsStorage.log)
  backend.eventEmitter.on('networkState', render)
  backend.eventEmitter.on('sync', success => {
    uploadsStorage.deleteUploads(success.uploadIdsToDelete)
    cardsStorage.updateCards(success.cards)
    morphemesStorage.updateMorphemes(success.morphemes)
  })

  function render() {
    ReactDOM.render(<App
      backend={backend.props}
      cards={cardsStorage.props}
      dictionary={dictionaryStorage.props}
      log={uploadsStorage.log}
      morphemes={morphemesStorage.props}
      uploads={uploadsStorage.props}
      wipeDb={wipeDb}
    />, document.getElementById('example'))
  }
  render()
}

main()