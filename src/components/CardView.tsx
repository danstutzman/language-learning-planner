import * as React from 'react'
import {Card} from '../CardsStorage'

interface Props {
  close: () => void
  card: Card
  save: (card: Card) => Promise<Card>
}

interface State {
  l1: string
  l2: string
}

export default class CardView extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      l1: props.card.l1,
      l2: props.card.l2,
    }
  }

  onChangeL1 = (e: any) => {
    const l1 = e.target.value
    this.setState({ l1 })
  }

  onChangeL2 = (e: any) => {
    const l2 = e.target.value
    this.setState({ l2 })
  }

  onClickSave = () => {
    this.props.save({
      ...this.props.card,
      l1: this.state.l1,
      l2: this.state.l2,
    })
  }

  render() {
    const { l1, l2 } = this.state

    return <div>
      <h2>
        Card ID={this.props.card.id}
        <button onClick={this.props.close}>X</button>
      </h2>

      <b>L1</b>
      <input type='text' value={l1} onChange={this.onChangeL1} />
      <br/>

      <b>L2</b>
      <input type='text' value={l2} onChange={this.onChangeL2} />
      <br/>

      <button onClick={this.onClickSave}>Save</button>
    </div>
  }
}
