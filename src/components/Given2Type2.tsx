import {Answer} from '../backend/Backend'
import {Card} from '../backend/Backend'
import './Given2Type2.css'
import * as React from 'react'

interface Props {
  card: Card
  speakL2: (l2: string) => void
  createAnswerAndAdvance: (answer: Answer) => void
}

interface State {
  answeredL2: string
  showMnemonic: boolean
  shownAt: Date
  firstKeyMillis: number | null
  lastKeyMillis: number | null
}

export default class Given2Type2 extends React.PureComponent<Props, State> {
  answeredL2Element: any
  timeoutToShowMnemonic: any

  constructor(props: Props) {
    super(props)
    this.state = {
      answeredL2: '',
      showMnemonic: false,
      shownAt: new Date(),
      firstKeyMillis: null,
      lastKeyMillis: null,
    }
  }

  componentDidMount() {
    this.answeredL2Element.focus()
    
    if (this.props.card.mnemonic21) {
      this.timeoutToShowMnemonic = setTimeout(
        () => this.setState({ showMnemonic: true }), 2000)
    }

    this.speakL2()
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if(this.props.card.id !== prevProps.card.id) {
      this.speakL2()
      this.setState({
        answeredL2: '',
        showMnemonic: false,
        shownAt: new Date(),
        firstKeyMillis: null,
        lastKeyMillis: null,
      })
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutToShowMnemonic)
  }

  onChangeAnsweredL2 = (e: any) => {
    const answeredL2 = e.target.value as string

    this.setState(prev => ({
      answeredL2,
      firstKeyMillis: prev.firstKeyMillis ||
        (new Date().getTime() - prev.shownAt.getTime()),
      lastKeyMillis: new Date().getTime() - prev.shownAt.getTime(),
    }))

    clearTimeout(this.timeoutToShowMnemonic)
  }

  gradeAnswer = (): string => {
    const { card } = this.props
    const { answeredL2, showMnemonic } = this.state
    if (answeredL2 === '') {
      return 'BLANK'
    } else if (answeredL2.toLowerCase() === card.l1.toLowerCase()) {
      return showMnemonic ? 'RIGHT_WITH_MNEMONIC' : 'RIGHT_WITHOUT_MNEMONIC'
    } else {
      return null
    }
  }

  onKeyDownAnsweredL2 = (e: any) => {
    if (e.key === 'Enter') {
      const { card } = this.props
      const { answeredL2, showMnemonic, shownAt,
        firstKeyMillis, lastKeyMillis } = this.state

      this.props.createAnswerAndAdvance({
        cardId:         card.id,
        type:           'Given2Type2',
        answeredL1:     null,
        answeredL2:     answeredL2,
        showedMnemonic: showMnemonic,
        grade:          this.gradeAnswer(),
        shownAt,
        firstKeyMillis,
        lastKeyMillis,
        misconnectedCardId: null,
      })
    }
  }

  speakL2 = () => {
    const l2 = this.props.card.l2
    this.props.speakL2(l2)
  }

  render() {
    const { card } = this.props
    const { l2 } = card

    return <div className='Given2Type2'>
      <button>Show L2</button>

      {false && <h1>{l2}</h1>}

      <button onClick={this.speakL2}>Speak L2</button>

      {this.state.showMnemonic &&
        <h2>{card.mnemonic21}</h2>}
      <input 
        type='text' 
        ref={e => this.answeredL2Element = e}
        value={this.state.answeredL2} 
        onChange={this.onChangeAnsweredL2}
        onKeyDown={this.onKeyDownAnsweredL2}
        autoFocus />
    </div>
  }
}
