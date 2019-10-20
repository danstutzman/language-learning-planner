import Backend from '../backend/Backend'
import {BackendProps} from '../backend/Backend'
import {Card} from '../backend/Backend'
import {CardList} from '../backend/Backend'
import CardView from './CardView'
import CardsView from './CardsView'
import {Challenge} from '../backend/Backend'
import {ChallengeList} from '../backend/Backend'
import ChallengesView from './ChallengesView'
import {EMPTY_CARD} from '../backend/Backend'
import {EMPTY_MORPHEME} from '../backend/Backend'
import Given1Type2 from './Given1Type2'
import Given2Type1 from './Given2Type1'
import {HashRouter} from 'react-router-dom'
import {Link} from 'react-router-dom'
import {Morpheme} from '../backend/Backend'
import {MorphemeList} from '../backend/Backend'
import MorphemeView from './MorphemeView'
import MorphemesView from './MorphemesView'
import * as React from 'react'
import {Route} from 'react-router-dom'
import {SkillList} from '../backend/Backend'
import SkillsView from './SkillsView'
import usePromise from 'react-promise'

interface Props {
  backend: BackendProps,
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

  renderChallengesView = (args: any) => {
    const promise = this.props.backend.listChallenges()
    return React.createElement(() => {
      const resolved = usePromise<ChallengeList>(promise)
      if (resolved.error) { return <div>Error {resolved.error.message}</div> }
      if (!resolved.value) { return <div>Loading...</div> }
      return <ChallengesView
        challengeList={resolved.value}
        updateChallenge={this.props.backend.updateChallenge} />
    })
  }

  renderGiven1Type2 = (args: any) => {
    const promise = this.props.backend.getTopChallenge('Given1Type2')
    return React.createElement(() => {
      const resolved = usePromise<Challenge>(promise)
      if (resolved.error) { return <div>Error {resolved.error.message}</div> }
      if (!resolved.value) { return <div>Loading...</div> }
      return <Given1Type2
        challenge={resolved.value}
        updateChallenge={this.props.backend.updateChallenge} />
    })
  }

  renderGiven2Type1 = (args: any) => {
    const promise = this.props.backend.getTopChallenge('Given2Type1')
    return React.createElement(() => {
      const resolved = usePromise<Challenge>(promise)
      if (resolved.error) { return <div>Error {resolved.error.message}</div> }
      if (!resolved.value) { return <div>Loading...</div> }
      return <Given2Type1
        updateChallenge={this.props.backend.updateChallenge}
        challenge={resolved.value} />
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

  renderSkillsView = (args: any) => {
    const promise = this.props.backend.listSkills()
    return React.createElement(() => {
      const resolved = usePromise<SkillList>(promise)
      if (resolved.error) { return <div>Error {resolved.error.message}</div> }
      if (!resolved.value) { return <div>Loading...</div> }
      return <SkillsView
        skillList={resolved.value} />
    })
  }
 
  render() {
    return <HashRouter>
      <div className="App">
        <Link to="/cards">Cards</Link>
        {' - '}
        <Link to="/challenges">Challenges</Link>
        {' - '}
        <Link to="/given1type2">Given1Type2</Link>
        {' - '}
        <Link to="/given2type1">Given2Type1</Link>
        {' - '}
        <Link to="/morphemes">Morphemes</Link>
        {' - '}
        <Link to="/skills">Skills</Link>
        <br/>

        <Route path="/cards" exact render={this.renderCardsView} />
        <Route path="/cards/:id" render={this.renderCardView} />
        <Route path="/challenges" exact render={this.renderChallengesView} />
        <Route path="/given1type2" render={this.renderGiven1Type2} />
        <Route path="/given2type1" render={this.renderGiven2Type1} />
        <Route path="/morphemes" exact render={this.renderMorphemesView} />
        <Route path="/morphemes/:id" render={this.renderMorphemeView} />
        <Route path="/skills" exact render={this.renderSkillsView} />
      </div>
    </HashRouter>
  }
}
