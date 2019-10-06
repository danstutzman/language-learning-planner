import Backend from '../backend/Backend'
import {BackendProps} from '../backend/Backend'
import {Card} from '../backend/Backend'
import {CardList} from '../backend/Backend'
import CardView from './CardView'
import CardsView from './CardsView'
import {EMPTY_MORPHEME} from '../backend/Backend'
import {HashRouter} from 'react-router-dom'
import {Link} from 'react-router-dom'
import {Morpheme} from '../backend/Backend'
import {MorphemeList} from '../backend/Backend'
import MorphemeView from './MorphemeView'
import MorphemesView from './MorphemesView'
import * as React from 'react'
import {Route} from 'react-router-dom'
import usePromise from 'react-promise'

interface Props {
  backend: BackendProps,
}

export default class App extends React.PureComponent<Props> {
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
        deleteMorpheme={this.props.backend.deleteMorpheme}
        history={args.history}
        morphemeList={morphemeList} />
    })
  }

  render() {
    return <HashRouter>
      <div className="App">
        <Link to="/cards">Cards</Link>
        <Link to="/morphemes">Morphemes</Link>
        <br/>

        <Route path="/cards" exact render={this.renderCardsView} />
        <Route path="/cards/:id" render={this.renderCardView} />
        <Route path="/morphemes" exact render={this.renderMorphemesView} />
        <Route path="/morphemes/:id" render={this.renderMorphemeView} />
      </div>
    </HashRouter>
  }
}
