import * as React from 'react'
import {Card} from '../backend/Backend'
import './CardView.css'
import {Morpheme} from '../backend/Backend'
import {MorphemeList} from '../backend/Backend'

interface Props {
  close: () => void
  card: Card
  save: (card: Card) => Promise<Card>
  guessMorphemes: (l2: string) => Promise<MorphemeList>
}

interface State {
  l1: string
  l2: string
  guessedMorphemes: MorphemeList
  morphemes: Array<Morpheme>
}

const NO_GUESSED_MORPHEMES: MorphemeList = {
  morphemes: [],
  countWithoutLimit: 0,
}

export default class CardView extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    const { l1, l2 } = props.card
    this.state = {
      l1,
      l2,
      guessedMorphemes: NO_GUESSED_MORPHEMES,
      morphemes: props.card.morphemes.concat([{ l2: '', gloss: '' }]),
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

  onChangeMorphemeL2 = (e: any) => {
    const l2 = e.target.value
    const index = parseInt(e.target.getAttribute('data-index'), 10)
    this.setState(prev => {
      if (index === prev.morphemes.length - 1) {
        this.props.guessMorphemes(l2).then(
          guessedMorphemes => this.setState({ guessedMorphemes }))
      }
      return {
        morphemes: prev.morphemes.slice(0, index)
          .concat([{ l2, gloss: prev.morphemes[index].gloss }])
          .concat(prev.morphemes.slice(index + 1)),
      }
    })
  }

  onChangeMorphemeGloss = (e: any) => {
    const gloss = e.target.value
    const index = parseInt(e.target.getAttribute('data-index'), 10)
    this.setState(prev => ({
      morphemes: prev.morphemes.slice(0, index)
        .concat([{ l2: prev.morphemes[index].l2, gloss }])
        .concat(prev.morphemes.slice(index + 1))
        .concat((index === prev.morphemes.length - 1) ?
          [{ l2: '', gloss: ''}] : []),
    }))
  }

  onClickGuessedMorpheme = (e: any) => {
    const index = parseInt(e.target.getAttribute('data-index'), 10)
    this.setState(prev => ({
      morphemes: prev.morphemes
        .slice(0, prev.morphemes.length - 1) // overwrite the last
        .concat([{
          l2: prev.guessedMorphemes.morphemes[index].l2,
          gloss: prev.guessedMorphemes.morphemes[index].gloss,
        }, {
          l2: '',
          gloss: '',
        }]),
      guessedMorphemes: NO_GUESSED_MORPHEMES,
    }))
  }

  onClickDeleteMorpheme = (e: any) => {
    const index = parseInt(e.target.getAttribute('data-index'), 10)
    this.setState(prev => ({
      morphemes: prev.morphemes
        .slice(0, index)
        .concat(prev.morphemes.slice(index + 1)),
      guessedMorphemes: NO_GUESSED_MORPHEMES,
    }))
  }

  onClickInsertMorpheme = (e: any) => {
    const index = parseInt(e.target.getAttribute('data-index'), 10)
    this.setState(prev => ({
      morphemes: prev.morphemes
        .slice(0, index + 1)
        .concat([{ l2: '', gloss: '' }])
        .concat(prev.morphemes.slice(index + 1)),
      guessedMorphemes: NO_GUESSED_MORPHEMES,
    }))
  }

  onClickSave = () => {
    const { l1, l2, morphemes } = this.state
    this.props.save({ ...this.props.card, l1, l2, morphemes })
  }

  render() {
    const {
      l1,
      l2,
      guessedMorphemes,
      morphemes,
    } = this.state
    const { card, close } = this.props

    return <div>
      <h2>
        Card ID={card.id}
        <button onClick={close}>X</button>
      </h2>

      <b>L1</b>
      <input type='text' value={l1} onChange={this.onChangeL1} autoFocus />
      <br/>

      <b>L2</b>
      <input
        type='text'
        value={l2}
        onChange={this.onChangeL2} />
      <br/>

      <b>Morphemes</b>
      <table>
        <thead>
          <tr>
            <th>L2</th>
            <th>Gloss</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {morphemes.map((m: Morpheme, i: number) => <tr key={i}>
            <td>
              <input
                type='text'
                value={m.l2}
                data-index={i}
                onChange={this.onChangeMorphemeL2} />
            </td>
            <td>
              <input
                type='text'
                value={m.gloss}
                data-index={i}
                onChange={this.onChangeMorphemeGloss} />
            </td>
            <td>
              <button
                data-index={i}
                onClick={this.onClickDeleteMorpheme}
                disabled={i === morphemes.length - 1}>Delete</button>
            </td>
            <td>
              <button
                data-index={i}
                onClick={this.onClickInsertMorpheme}
                disabled={i === morphemes.length - 1}>Insert</button>
            </td>
          </tr>)}
        </tbody>
      </table>

      <table style={{border: '1px black solid'}}>
        <tbody>
          {guessedMorphemes.morphemes.map((m: Morpheme, i: number) =>
            <tr key={i} className='darken-on-hover'>
              <td onClick={this.onClickGuessedMorpheme} data-index={i}>
                {m.l2}
              </td>
              <td onClick={this.onClickGuessedMorpheme} data-index={i}>
                {m.gloss}
              </td>
            </tr>)}
        </tbody>
      </table>

      <button onClick={this.onClickSave}>Save</button>
    </div>
  }
}
