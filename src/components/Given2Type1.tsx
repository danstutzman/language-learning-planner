import {Challenge} from '../backend/Backend'
import * as React from 'react'

interface Props {
  answer: (answer: Challenge) => Promise<void>,
  challenge: Challenge
}

interface State {
  answeredL1: string,
  showMnemonic: boolean,
}

export default class Given2Type1 extends React.PureComponent<Props, State> {
  answeredL1Element: any
  timeoutToShowMnemonic: any

  constructor(props: Props) {
    super(props)
    this.state = {
      answeredL1: '',
      showMnemonic: false,
    }
  }

  componentDidMount() {
    this.answeredL1Element.focus()
    this.timeoutToShowMnemonic = setTimeout(
      () => this.setState({ showMnemonic: true }), 2000)
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutToShowMnemonic)
  }

  onChangeAnsweredL1 = (e: any) => {
    const answeredL1 = e.target.value
    this.setState({ answeredL1 })
    clearTimeout(this.timeoutToShowMnemonic)
  }

  onKeyDownAnsweredL1 = (e: any) => {
    if (e.key === 'Enter') {
      const { challenge } = this.props
      this.props.answer({
        type: 'Given2Type1',
        cardId: challenge.cardId,
        answeredL1: this.state.answeredL1,
        answeredAt: new Date(),
        showedMnemonic: this.state.showMnemonic,
        mnemonic: challenge.mnemonic,
      }).then(() => window.location.reload())
    }
  }

  render() {
    const { challenge } = this.props
    const { l2 } = challenge.card

    return <div>
      <h1>{l2}</h1>
      {this.state.showMnemonic &&
        <h2>{challenge.mnemonic}</h2>}
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