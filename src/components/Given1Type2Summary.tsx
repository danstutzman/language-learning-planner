import {Answer} from '../backend/Backend'
import {CardList} from '../backend/Backend'
import Given1Type2 from './Given1Type2'
import './Given1Type2Summary.css'
import * as React from 'react'

interface Props {
  cardList: CardList
  initSynthesizer: () => Promise<void>,
  createAnswer: (answer: Answer) => Promise<Answer>,
}

interface State {
  isSynthesizerInitialized: boolean,
  numCard: number | null,
}

export default class Given1Type2Summary
  extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      isSynthesizerInitialized: false,
      numCard: null,
    }
  }

  componentDidMount() {
    this.props.initSynthesizer()
      .then(() => this.setState({ isSynthesizerInitialized: true }))
  }

  onClickShowCard = () =>
    this.setState({ numCard: 0 })

  createAnswerAndAdvance = (answer: Answer) => {
    this.props.createAnswer(answer)
    this.setState(prev => ({ numCard: prev.numCard + 1 }))
  }
    
  render() {
    const { numCard } = this.state
    const { cardList } = this.props
    const cards = cardList.cards

    return <div className='Given1Type2Summary'>
      <h1>Given1Type2 Summary</h1>

      <div>
        Current card: {numCard}/{cards.length}
      </div>

      {!this.state.isSynthesizerInitialized && "Waiting for text-to-speech..."}

      {this.state.numCard == null &&
        <button onClick={this.onClickShowCard}
          disabled={!this.state.isSynthesizerInitialized}>
          Show card
        </button>}

      {this.state.numCard != null &&
        numCard < cards.length &&
        <Given1Type2 card={cards[numCard]}
          createAnswerAndAdvance={this.createAnswerAndAdvance} />}
    </div>
  }
}
