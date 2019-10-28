import {Answer} from '../backend/Backend'
import AnswersView from './AnswersView'
import {AnswerList} from '../backend/Backend'
import Backend from '../backend/Backend'
import {BackendProps} from '../backend/Backend'
import {Card} from '../backend/Backend'
import {CardList} from '../backend/Backend'
import CardView from './CardView'
import CardsView from './CardsView'
import {EMPTY_CARD} from '../backend/Backend'
import {EMPTY_MORPHEME} from '../backend/Backend'
import Given2Type2Summary from './Given2Type2Summary'
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
  initSynthesizer: () => Promise<void>,
  speakL2: (l2: string) => void,
}

export default class App extends React.PureComponent<Props> {
  renderCardView = (args: any) => {
    const { id } = args.match.params
    const { backend } = this.props
    if (id === 'new') {
      const save = (card: Card) =>
        backend.createCard(card).then(card => {
          args.history.replace(`/cards/${card.id}`)
          return card
        })
      return <CardView
        close={args.history.goBack}
        card={EMPTY_CARD}
        guessMorphemes={backend.guessMorphemes}
        parseL2Phrase={backend.parseL2Phrase}
        save={save} />
    } else {
      const promise = backend.showCard(parseInt(id, 10))
      return React.createElement(() => {
        const resolved = usePromise<Card>(promise)
        if (resolved.error) { return <div>Error {resolved.error.message}</div> }
        if (!resolved.value) { return <div>Loading...</div> }
        return <CardView
          close={args.history.goBack}
          card={resolved.value}
          guessMorphemes={backend.guessMorphemes}
          parseL2Phrase={backend.parseL2Phrase}
          save={backend.updateCard} />
      })
    }
  }

  renderCardsView = (args: any) => {
    const promise = this.props.backend.listCards()
    return React.createElement(() => {
      const resolved = usePromise<CardList>(promise)
      if (resolved.error) { return <div>Error {resolved.error.message}</div> }
      if (!resolved.value) { return <div>Loading...</div> }
      return <CardsView
        cardList={resolved.value}
        deleteCard={this.props.backend.deleteCard}
        history={args.history} />
    })
  }

  renderAnswersView = (args: any) => {
    const promise = this.props.backend.listAnswers()
    return React.createElement(() => {
      const resolved = usePromise<AnswerList>(promise)
      if (resolved.error) { return <div>Error {resolved.error.message}</div> }
      if (!resolved.value) { return <div>Loading...</div> }
      return <AnswersView
        answerList={resolved.value}
        updateAnswer={this.props.backend.updateAnswer} />
    })
  }

  renderGiven2Type2Summary = (args: any) => {
    const promise = this.props.backend.getTopCards('Given2Type2')
    return React.createElement(() => {
      const resolved = usePromise<CardList>(promise)
      if (resolved.error) { return <div>Error {resolved.error.message}</div> }
      if (!resolved.value) { return <div>Loading card...</div> }
      return <Given2Type2Summary
        initSynthesizer={this.props.initSynthesizer}
        createAnswer={this.props.backend.createAnswer}
        cardList={resolved.value}
        speakL2={this.props.speakL2} />
    })
  }

  renderMorphemeView = (args: any) => {
    const { id } = args.match.params
    const { backend } = this.props

    if (id === 'new') {
      const save = (morpheme: Morpheme) =>
        backend.createMorpheme(morpheme).then(morpheme => {
          args.history.replace(`/morphemes/${morpheme.id}`)
          return morpheme
        })
      return <MorphemeView
        close={args.history.goBack}
        morpheme={EMPTY_MORPHEME}
        save={save} />
    } else {
      const promise = backend.showMorpheme(parseInt(id, 10))
      return React.createElement(() => {
        const resolved = usePromise<Morpheme>(promise)
        if (resolved.error) { return <div>Error {resolved.error.message}</div> }
        if (!resolved) { return <div>Loading...</div> }
        return <MorphemeView
          close={args.history.goBack}
          morpheme={resolved.value}
          save={backend.updateMorpheme} />
      })
    }
  }

  renderMorphemesView = (args: any) => {
    const promise = this.props.backend.listMorphemes()
    return React.createElement(() => {
      const resolved = usePromise<MorphemeList>(promise)
      if (resolved.error) { return <div>Error {resolved.error.message}</div> }
      if (!resolved) { return <div>Loading...</div> }
      return <MorphemesView
        deleteMorpheme={this.props.backend.deleteMorpheme}
        history={args.history}
        morphemeList={resolved.value} />
    })
  }

  render() {
    return <HashRouter>
      <div className="App">
        <Link to="/answers">Answers</Link>
        {' - '}
        <Link to="/cards">Cards</Link>
        {' - '}
        <Link to="/given2type2">Given2Type2</Link>
        {' - '}
        <Link to="/morphemes">Morphemes</Link>
        <br/>

        <Route path="/answers" exact render={this.renderAnswersView} />
        <Route path="/cards" exact render={this.renderCardsView} />
        <Route path="/cards/:id" render={this.renderCardView} />
        <Route path="/given2type2" render={this.renderGiven2Type2Summary} />
        <Route path="/morphemes" exact render={this.renderMorphemesView} />
        <Route path="/morphemes/:id" render={this.renderMorphemeView} />
      </div>
    </HashRouter>
  }
}
