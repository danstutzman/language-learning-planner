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
    this.props.wipeDb()
    window.alert('Database wiped.')
    window.location.reload()
  }

  renderMorphemeView = (args: any) => {
    const { morphemes } = this.props
    const id: string = args.match.params.id
    const morpheme = morphemes.morphemeById[parseInt(id, 10)]
    const save = (morpheme: Morpheme) => morphemes.updateMorpheme(morpheme)
    return <MorphemeView
      close={args.history.goBack}
      morpheme={morpheme}
      save={save} />
  }


  renderMorphemesView = (args: any) =>
    <MorphemesView
      history={args.history}
      morphemes={this.props.morphemes} />

  renderCardView = (args: any) => {
    const { cards } = this.props
    const id: string = args.match.params.id
    const card = cards.cardById[parseInt(id, 10)]
    const save = (card: Card) => cards.updateCard(card)
    return <CardView
      close={args.history.goBack}
      card={card}
      save={save} />
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
