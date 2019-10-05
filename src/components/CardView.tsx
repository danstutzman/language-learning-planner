import * as React from 'react'
import {Card} from '../CardsStorage'
import {Morpheme} from '../MorphemesStorage'
import {MorphemesProps} from '../MorphemesStorage'

interface Props {
  close: () => void
  card: Card
  save: (card: Card) => Promise<Card>
  guessMorphemes: (l2: string) => Promise<Array<Morpheme>>
}

interface State {
  l1: string
  l2: string
  guessedMorphemes: null | Array<Morpheme>
}

export default class CardView extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      l1: props.card.l1,
      l2: props.card.l2,
      guessedMorphemes: null,
    }
  }

  componentDidMount() {
    this.props.guessMorphemes(this.state.l2)
      .then((guessedMorphemes: Array<Morpheme>) =>
        this.setState({ guessedMorphemes }))
  }

  onChangeL1 = (e: any) => {
    const l1 = e.target.value
    this.setState({ l1 })
  }

  onChangeL2 = (e: any) => {
    const l2 = e.target.value
    this.props.guessMorphemes(l2)
      .then(guessedMorphemes => this.setState({ guessedMorphemes }))
    this.setState({ l2 })
  }

  onClickSave = () => {
    const { l1, l2 } = this.state

    this.props.save({ ...this.props.card, l1, l2 })
  }

  render() {
    const { l1, l2, guessedMorphemes  } = this.state
    const { card, close } = this.props

    return <div>
      <h2>
        Card ID={card.id}
        <button onClick={close}>X</button>
      </h2>

      <b>L1</b>
      <input type='text' value={l1} onChange={this.onChangeL1} />
      <br/>

      <b>L2</b>
      <input
        type='text'
        value={l2}
        onChange={this.onChangeL2} />
      <br/>

      <b>Guessed Morphemes</b>
      {guessedMorphemes === null ? 'Loading' :
        <table>
          <tbody>
            {guessedMorphemes.map((morpheme: Morpheme, i: number) =>
              <tr key={i}>
                <td>{morpheme.id}</td>
                <td>{morpheme.l2}</td>
              </tr>)}
          </tbody>
        </table>}

      <button onClick={this.onClickSave}>Save</button>
    </div>
  }
}
