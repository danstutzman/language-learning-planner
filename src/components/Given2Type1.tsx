import {Challenge} from '../backend/Backend'
import {ChallengeUpdate} from '../backend/Backend'
import './Given2Type1.css'
import * as React from 'react'

interface Props {
  challenge: Challenge
  updateChallenge: (update: ChallengeUpdate) => Promise<void>,
}

interface State {
  answeredL1: string
  showMnemonic: boolean
  shownAt: Date
  firstKeyMillis: number | null
  lastKeyMillis: number | null
}

export default class Given2Type1 extends React.PureComponent<Props, State> {
  answeredL1Element: any
  timeoutToShowMnemonic: any

  constructor(props: Props) {
    super(props)
    this.state = {
      answeredL1: '',
      showMnemonic: false,
      shownAt: new Date(),
      firstKeyMillis: null,
      lastKeyMillis: null,
    }
  }

  componentDidMount() {
    this.answeredL1Element.focus()
    
    if (this.props.challenge.card.mnemonic21) {
      this.timeoutToShowMnemonic = setTimeout(
        () => this.setState({ showMnemonic: true }), 2000)
    }

    this.speakL2()
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutToShowMnemonic)
  }

  onChangeAnsweredL1 = (e: any) => {
    const answeredL1 = e.target.value as string

    this.setState(prev => ({
      answeredL1,
      firstKeyMillis: prev.firstKeyMillis ||
        (new Date().getTime() - prev.shownAt.getTime()),
      lastKeyMillis: new Date().getTime() - prev.shownAt.getTime(),
    }))

    clearTimeout(this.timeoutToShowMnemonic)
  }

  gradeAnswer = (): string => {
    const { challenge } = this.props
    const { answeredL1, showMnemonic } = this.state
    if (answeredL1 === '') {
      return 'BLANK'
    } else if (answeredL1.toLowerCase() === challenge.card.l1.toLowerCase()) {
      return showMnemonic ? 'RIGHT_WITH_MNEMONIC' : 'RIGHT_WITHOUT_MNEMONIC'
    } else {
      return null
    }
  }

  onKeyDownAnsweredL1 = (e: any) => {
    if (e.key === 'Enter') {
      const { challenge } = this.props
      const { answeredL1, showMnemonic, shownAt,
        firstKeyMillis, lastKeyMillis } = this.state

      this.props.updateChallenge({
        id:             challenge.id,
        answeredL1:     answeredL1,
        showedMnemonic: showMnemonic,
        grade:          this.gradeAnswer(),
        shownAt,
        firstKeyMillis,
        lastKeyMillis,
      })
    }
  }

  speakL2 = () => {
    const l2 = this.props.challenge.card.l2
    const utterance = new SpeechSynthesisUtterance(l2)

    for (const voice of window.speechSynthesis.getVoices()) {
      if (voice.lang.startsWith('es')) {
        utterance.voice = voice
        break
      }
    }

    const voiceName = 'Angelica'
    for (const voice of window.speechSynthesis.getVoices()) {
      if (voice.name === voiceName) {
        utterance.voice = voice
      }
    }

    window.speechSynthesis.speak(utterance)
  }

  render() {
    const { challenge } = this.props
    const { l2 } = challenge.card

    return <div className='Given2Type1'>
      <button>Show L2</button>

      {false && <h1>{l2}</h1>}

      <button onClick={this.speakL2}>Speak L2</button>

      {this.state.showMnemonic &&
        <h2>{challenge.card.mnemonic21}</h2>}
      <input 
        type='text' 
        ref={e => this.answeredL1Element = e}
        value={this.state.answeredL1} 
        onChange={this.onChangeAnsweredL1}
        onKeyDown={this.onKeyDownAnsweredL1}
        autoFocus />
    </div>
  }
}