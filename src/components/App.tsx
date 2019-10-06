import {BackendProps} from '../backend/Backend'
import {Card} from '../storage/CardsStorage'
import {CardsProps} from '../storage/CardsStorage'
import CardView from './CardView'
import CardsView from './CardsView'
import {DictionaryProps} from '../storage/DictionaryStorage'
import DictionaryScreen from './DictionaryScreen'
import { HashRouter } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {Morpheme} from '../storage/MorphemesStorage'
import {MorphemeList} from '../backend/Backend'
import {MorphemesProps} from '../storage/MorphemesStorage'
import MorphemeView from './MorphemeView'
import MorphemesView from './MorphemesView'
import {PartialMorpheme} from '../storage/MorphemesStorage'
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

  renderDictionary = () =>
    <DictionaryScreen
      backend={this.props.backend}
      dictionary={this.props.dictionary}
      log={this.props.log} />

  renderMorphemeView = (args: any) => {
    const id: number = parseInt(args.match.params.id, 10)
    const promise = this.props.backend.showMorpheme(id)
    return React.createElement(() => {
      const {value, loading} = usePromise<Morpheme>(promise)
      const save = (morpheme: Morpheme) => Promise.resolve(morpheme)
      if (loading) { return <div>Loading...</div> }
      return <MorphemeView
        close={args.history.goBack}
        morpheme={value}
        save={save} />
    })
  }

  renderMorphemesView = (args: any) => {
    const promise = this.props.backend.listMorphemes()
    return React.createElement(() => {
      const {value, loading} = usePromise<MorphemeList>(promise)
      return <MorphemesView
        history={args.history}
        loading={loading}
        morphemeList={value} />
    })
  }

  renderCardView = (args: any) => {
    const { cards, morphemes } = this.props
    const id: string = args.match.params.id

    if (!cards.hasLoaded || !morphemes.hasLoaded) {
      return <div>Loading...</div>
    }

    const card = cards.cardById[parseInt(id, 10)]
    if (card) {
      const initialMorphemes = card.morphemeIds.map(morphemeId =>
        morphemes.morphemeById[morphemeId])
      const save = (card: Card, partialMorphemes: Array<PartialMorpheme>) =>
        morphemes.findOrCreateMorphemes(partialMorphemes)
          .then(morphemes => cards.updateCard({
            ...card,
            morphemeIds: morphemes.map(m => m.id),
          }))
      return <CardView
        close={args.history.goBack}
        card={card}
        initialMorphemes={initialMorphemes}
        guessMorphemes={morphemes.guessMorphemes}
        save={save} />
    } else {
      return <div>Not found</div>
    }
  }

  renderCardsView = (args: any) =>
    <CardsView
      history={args.history}
      cards={this.props.cards} />

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
        <span>networkState={this.props.backend.networkState}</span>
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
