import {Answer} from '../backend/Backend'
import {Card} from '../backend/Backend'
import * as React from 'react'

interface Props {
  card: Card
  answer: (answer: Answer) => Promise<void>,
}

interface State {
  answeredL2: string,
}

export default class Given1Type2 extends React.PureComponent<Props, State> {
  answeredL2Element: any

  constructor(props: Props) {
    super(props)
    this.state = {
      answeredL2: '',
    }
  }

  componentDidMount() {
    this.answeredL2Element.focus()
  }

  onChangeAnsweredL2 = (e: any) => {
    const answeredL2 = e.target.value
    this.setState({ answeredL2 })
  }

  onKeyDownAnsweredL2 = (e: any) => {
    if (e.key === 'Enter') {
      this.props.answer({
        cardId: this.props.card.id,
        l2: this.state.answeredL2,
        answeredAt: new Date(),
      }).then(() => window.location.reload())
    }
  }

  render() {
    const { l1, l2 } = this.props.card

    return <div>
      <h1>{l1}</h1>
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
