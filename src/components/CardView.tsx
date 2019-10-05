import * as React from 'react'
import {Card} from '../CardsStorage'
import {GuessedMorpheme} from '../MorphemesStorage'
import {Morpheme} from '../MorphemesStorage'
import {MorphemesProps} from '../MorphemesStorage'

interface Props {
  close: () => void
  card: Card
  save: (card: Card) => Promise<Card>
  guessMorphemes: (l2: string) => Promise<Array<GuessedMorpheme>>
}

interface State {
  l1: string
  l2: string
  guessedMorphemes: null | Array<GuessedMorpheme>
  acceptedMorphemeIds: {[morphemeId: number]: true}
}

export default class CardView extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    const { l1, l2, acceptedMorphemeIds } = props.card
    this.state = {
      l1,
      l2,
      acceptedMorphemeIds,
      guessedMorphemes: null,
    }
  }

  componentDidMount() {
    this.props.guessMorphemes(this.state.l2)
      .then(this.updateStateWithGuessedMorphemes)
  }

  updateStateWithGuessedMorphemes =
      (guessedMorphemes: Array<GuessedMorpheme>) => {
    this.setState(prevState => {
      if (guessedMorphemes.map(m => m.id).join(',') ===
          (prevState.guessedMorphemes || []).map(m => m.id).join(',')) {
        return { guessedMorphemes, acceptedMorphemeIds: {} }
      } else {
        // unnecessary but satisfies type checker
        return { guessedMorphemes,
          acceptedMorphemeIds: prevState.acceptedMorphemeIds }
      }
    })
  }

  onChangeL1 = (e: any) => {
    const l1 = e.target.value
    this.setState({ l1 })
  }

  onChangeL2 = (e: any) => {
    const l2 = e.target.value

    this.props.guessMorphemes(l2).then(this.updateStateWithGuessedMorphemes)

    this.setState({ l2 })
  }

  onChangeAcceptedMorphemeIds = (e: any) => {
    const accepted = e.target.checked
    const morphemeId = e.target.getAttribute('data-morpheme-id')
    if (accepted) {
      this.setState(prevState => ({
        acceptedMorphemeIds: {
          ...prevState.acceptedMorphemeIds,
          [morphemeId]: true,
        },
      }))
    } else {
      this.setState(prevState => {
        const acceptedMorphemeIds = { ...prevState.acceptedMorphemeIds }
        delete acceptedMorphemeIds[morphemeId]
        return { acceptedMorphemeIds }
      })
    }
  }

  onClickSave = () => {
    const { l1, l2, acceptedMorphemeIds } = this.state

    this.props.save({
      ...this.props.card,
      l1,
      l2,
      acceptedMorphemeIds,
    })
  }

  render() {
    const { l1, l2, guessedMorphemes, acceptedMorphemeIds } = this.state
    const { card, close } = this.props

    return <div>
      <h2>
        Card ID={card.id}
        {JSON.stringify(acceptedMorphemeIds)}
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
            {guessedMorphemes.map((row: GuessedMorpheme, i: number) =>
              <tr key={i}>
                <td>
                  <input
                    type='checkbox'
                    data-morpheme-id={row.id}
                    checked={acceptedMorphemeIds[row.id] || false}
                    onChange={this.onChangeAcceptedMorphemeIds} />
                </td>
                <td>{row.id}</td>
                <td>{row.l2Index}</td>
                <td>{row.l2}</td>
              </tr>)}
          </tbody>
        </table>}

      <button onClick={this.onClickSave}>Save</button>
    </div>
  }
}
