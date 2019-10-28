import {Answer} from '../backend/Backend'
import {CardList} from '../backend/Backend'
import Given2Type2 from './Given2Type2'
import './Given2Type2Summary.css'
import * as React from 'react'

interface Props {
  cardList: CardList
  initSynthesizer: () => Promise<void>,
  speakL2: (l2: string) => void,
  createAnswer: (answer: Answer) => Promise<Answer>,
}

interface State {
  isSynthesizerInitialized: boolean,
  numCard: number | null,
}

export default class Given2Type2Summary
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

    return <div className='Given2Type2Summary'>
      <h1>Given2Type2 Summary</h1>

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
        <Given2Type2 card={cards[numCard]}
          speakL2={this.props.speakL2}
          createAnswerAndAdvance={this.createAnswerAndAdvance} />}
    </div>
  }
}
