import Backend, {BackendProps} from '../backend/Backend'
import {Card} from '../storage/CardsStorage'
import {CardList} from '../backend/Backend'
import {CardsProps} from '../storage/CardsStorage'
import CardView from './CardView'
import CardsView from './CardsView'
import {DictionaryProps} from '../storage/DictionaryStorage'
import DictionaryScreen from './DictionaryScreen'
import {EMPTY_MORPHEME} from '../storage/MorphemesStorage'
import { HashRouter } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {Morpheme} from '../storage/MorphemesStorage'
import {MorphemeList} from '../backend/Backend'
import {MorphemesProps} from '../storage/MorphemesStorage'
import MorphemeView from './MorphemeView'
import MorphemesView from './MorphemesView'
import * as React from 'react'
import { Route } from 'react-router-dom'
import {UploadsProps} from '../storage/UploadsStorage'
import usePromise from 'react-promise'

interface Props {
  backend: BackendProps,
  cards: CardsProps
  dictionary: DictionaryProps,
  log: (event: string, details?: {}) => void,
  morphemes: MorphemesProps
  uploads: UploadsProps,
  wipeDb: () => void
}

export default class App extends React.PureComponent<Props> {
  onClickWipeDb = () => {
    if (window.confirm('Are you sure you want to wipe the database?')) {
      this.props.wipeDb()
      window.alert('Database wiped.')
      window.location.reload()
    }
  }

  onClickDownloadDictionary = () =>
    this.props.backend.downloadDictionary()
      .then(wordPairs => this.props.dictionary.saveDictionary(wordPairs))
      .catch(e => console.warn('Error downloading dictionary', e))

  onClickSyncBackend = () =>
    this.props.uploads.listUploads()
      .then(uploads => this.props.backend.sync(uploads))
      .catch(e => console.warn('Sync error', e))

  renderCardView = (args: any) => {
    const id: number = parseInt(args.match.params.id, 10)
    const promise = this.props.backend.showCard(id)
    return React.createElement(() => {
      const card = usePromise<Card>(promise).value
      if (!card) { return <div>Loading...</div> }
      return <CardView
        close={args.history.goBack}
        card={card}
        guessMorphemes={this.props.backend.guessMorphemes}
        save={this.props.backend.updateCard} />
    })
  }

  renderCardsView = (args: any) => {
    const promise = this.props.backend.listCards()
    return React.createElement(() => {
      const cardList = usePromise<CardList>(promise).value
      return <CardsView
        cardList={cardList}
        history={args.history} />
    })
  }

  renderDictionary = () =>
    <DictionaryScreen
      backend={this.props.backend}
      dictionary={this.props.dictionary}
      log={this.props.log} />

  renderMorphemeView = (args: any) => {
    const { id } = args.match.params
    const { backend } = this.props

    if (id === 'new') {
      const save = (morpheme: Morpheme) =>
        backend.createMorpheme(morpheme).then(morpheme => {
          args.history.push(`/morphemes/${morpheme.id}`)
          return morpheme
        })
      return <MorphemeView
        close={args.history.goBack}
        morpheme={EMPTY_MORPHEME}
        save={save} />
    } else {
      const promise = backend.showMorpheme(parseInt(id, 10))
      return React.createElement(() => {
        const morpheme = usePromise<Morpheme>(promise).value
        if (!morpheme) { return <div>Loading...</div> }
        return <MorphemeView
          close={args.history.goBack}
          morpheme={morpheme}
          save={backend.updateMorpheme} />
      })
    }
  }

  renderMorphemesView = (args: any) => {
    const promise = this.props.backend.listMorphemes()
    return React.createElement(() => {
      const morphemeList = usePromise<MorphemeList>(promise).value
      return <MorphemesView
        history={args.history}
        morphemeList={morphemeList} />
    })
  }


  render() {
    return <HashRouter>
      <div className="App">
        <Link to="/cards">Cards</Link>
        <Link to="/dictionary">Dictionary</Link>
        <Link to="/morphemes">Morphemes</Link>
        <br/>

        <button onClick={this.onClickWipeDb}>Wipe database</button>
        <button onClick={this.onClickSyncBackend}>Sync backend</button>
        <button onClick={this.onClickDownloadDictionary}>
          Download Dictionary
        </button>
        <hr />

        <Route path="/cards" exact render={this.renderCardsView} />
        <Route path="/cards/:id" render={this.renderCardView} />
        <Route path="/dictionary" render={this.renderDictionary} />
        <Route path="/morphemes" exact render={this.renderMorphemesView} />
        <Route path="/morphemes/:id" render={this.renderMorphemeView} />
      </div>
    </HashRouter>
  }
}
