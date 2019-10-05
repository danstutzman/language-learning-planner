import * as React from 'react'
import {Card} from '../CardsStorage'

interface Props {
  close: () => void
  card: Card
  save: (card: Card) => Promise<Card>
}

interface State {
  text: string
}

export default class CardView extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      text: props.card.text,
    }
  }

  onChangeText = (e: any) => {
    const text = e.target.value
    this.setState({ text })
  }

  onClickSave = () => {
    this.props.save({
      ...this.props.card,
      text: this.state.text,
    })
  }

  render() {
    const { text } = this.state
    return <div>
      <h2>
        Card ID={this.props.card.id}
        <button onClick={this.props.close}>X</button>
      </h2>

      <b>Text</b><br/>
      <textarea value={text} onChange={this.onChangeText}></textarea>

      <button onClick={this.onClickSave}>Save</button>
    </div>
  }
}
