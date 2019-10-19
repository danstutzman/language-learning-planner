import {Challenge} from '../backend/Backend'
import {ChallengeUpdate} from '../backend/Backend'
import * as React from 'react'

interface Props {
  challenge: Challenge
  updateChallenge: (update: ChallengeUpdate) => Promise<void>,
}

interface State {
  answeredL2: string,
  showMnemonic: boolean,
  shownAt: Date,
  firstKeyMillis: number | null,
  lastKeyMillis: number | null,
}

export default class Given1Type2 extends React.PureComponent<Props, State> {
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
    this.timeoutToShowMnemonic = setTimeout(
      () => this.setState({ showMnemonic: true }), 2000)
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
    const { challenge } = this.props
    const { answeredL2 } = this.state
    if (answeredL2 === '') {
      return 'BLANK'
    } else if (answeredL2.toLowerCase() === challenge.card.l2.toLowerCase()) {
      return 'RIGHT'
    } else {
      return null
    }
  }

  onKeyDownAnsweredL2 = (e: any) => {
    if (e.key === 'Enter') {
      const { challenge } = this.props
      const { answeredL2, showMnemonic, shownAt, firstKeyMillis,
        lastKeyMillis } = this.state

      this.props.updateChallenge({
        id:             challenge.id,
        answeredL2:     answeredL2,
        showedMnemonic: showMnemonic,
        grade:          this.gradeAnswer(),
        shownAt,
        firstKeyMillis,
        lastKeyMillis,
      }).then(() => window.location.reload())
    }
  }

  render() {
    const { challenge } = this.props
    const { l1, l2 } = challenge.card

    return <div>
      <h1>{l1}</h1>
      {this.state.showMnemonic &&
        <h2>{challenge.card.mnemonic12}</h2>}
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
