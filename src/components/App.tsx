import {Card} from '../CardsStorage'
import {CardsProps} from '../CardsStorage'
import CardView from './CardView'
import CardsView from './CardsView'
import { HashRouter } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {Morpheme} from '../MorphemesStorage'
import {MorphemesProps} from '../MorphemesStorage'
import MorphemeView from './MorphemeView'
import MorphemesView from './MorphemesView'
import * as React from 'react'
import { Route } from 'react-router-dom'

interface AppProps {
  cards: CardsProps
  morphemes: MorphemesProps
  wipeDb: () => void
}

export default class App extends React.PureComponent<AppProps> {
  onClickWipeDb = () => {
    if (window.confirm('Are you sure you want to wipe the database?')) {
      this.props.wipeDb()
      window.alert('Database wiped.')
      window.location.reload()
    }
  }

  renderMorphemeView = (args: any) => {
    const { morphemes } = this.props
    const id: string = args.match.params.id

    if (!morphemes.hasLoaded) {
      return <div>Loading...</div>
    }

    const morpheme = morphemes.morphemeById[parseInt(id, 10)]
    if (morpheme) {
      const save = (morpheme: Morpheme) => morphemes.updateMorpheme(morpheme)
      return <MorphemeView
        close={args.history.goBack}
        morpheme={morpheme}
        save={save} />
    } else {
      return <div>Not found</div>
    }
  }


  renderMorphemesView = (args: any) =>
    <MorphemesView
      history={args.history}
      morphemes={this.props.morphemes} />

  renderCardView = (args: any) => {
    const { cards, morphemes } = this.props
    const id: string = args.match.params.id

    if (!cards.hasLoaded || !morphemes.hasLoaded) {
      return <div>Loading...</div>
    }

    const card = cards.cardById[parseInt(id, 10)]
    if (card) {
      const save = (card: Card) => cards.updateCard(card)
      return <CardView
        close={args.history.goBack}
        card={card}
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
        <Link to="/morphemes">Morphemes</Link>
        <br/>
        <button onClick={this.onClickWipeDb}>Wipe database</button>
        <br/>

        <Route path="/cards" exact render={this.renderCardsView} />
        <Route path="/cards/:id" render={this.renderCardView} />
        <Route path="/morphemes" exact render={this.renderMorphemesView} />
        <Route path="/morphemes/:id" render={this.renderMorphemeView} />
      </div>
    </HashRouter>
  }
}
