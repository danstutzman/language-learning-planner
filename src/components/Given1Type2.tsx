import {Challenge} from '../backend/Backend'
import * as React from 'react'

interface Props {
  answer: (answer: Challenge) => Promise<void>,
  challenge: Challenge
}

interface State {
  answeredL2: string,
  showMnemonic: boolean,
}

export default class Given1Type2 extends React.PureComponent<Props, State> {
  answeredL2Element: any
  timeoutToShowMnemonic: any

  constructor(props: Props) {
    super(props)
    this.state = {
      answeredL2: '',
      showMnemonic: false,
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
    const answeredL2 = e.target.value
    this.setState({ answeredL2 })
    clearTimeout(this.timeoutToShowMnemonic)
  }

  onKeyDownAnsweredL2 = (e: any) => {
    if (e.key === 'Enter') {
      const { challenge } = this.props
      this.props.answer({
        type: 'Given1Type2',
        cardId: challenge.cardId,
        l2: this.state.answeredL2,
        answeredL2: this.state.answeredL2,
        answeredAt: new Date(),
        showedMnemonic: this.state.showMnemonic,
        mnemonic: challenge.mnemonic,
      }).then(() => window.location.reload())
    }
  }

  render() {
    const { challenge } = this.props
    const { l1, l2 } = challenge.card

    return <div>
      <h1>{l1}</h1>
      {this.state.showMnemonic &&
        <h2>{challenge.mnemonic}</h2>}
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
