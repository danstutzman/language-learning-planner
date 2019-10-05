import * as React from 'react'
import {Card} from '../CardsStorage'
import './CardView.css'
import {Morpheme} from '../MorphemesStorage'
import {MorphemesProps} from '../MorphemesStorage'
import {PartialMorpheme} from '../MorphemesStorage'

interface Props {
  close: () => void
  card: Card
  save: (card: Card, partialMorphemes: Array<PartialMorpheme>) => Promise<Card>
  guessMorphemes: (l2: string) => Promise<Array<Morpheme>>
  initialMorphemes: Array<PartialMorpheme>,
}

interface State {
  l1: string
  l2: string
  guessedMorphemes: Array<Morpheme>
  partialMorphemes: Array<PartialMorpheme>
}

export default class CardView extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    const { l1, l2 } = props.card
    this.state = {
      l1,
      l2,
      guessedMorphemes: [],
      partialMorphemes: props.initialMorphemes.concat([{ l2: '', gloss: '' }]),
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

  onChangePartialMorphemeL2 = (e: any) => {
    const l2 = e.target.value
    const index = parseInt(e.target.getAttribute('data-index'), 10)
    this.setState(prev => {
      if (index === prev.partialMorphemes.length - 1) {
        this.props.guessMorphemes(l2).then(
          guessedMorphemes => this.setState({ guessedMorphemes }))
      }
      return {
        partialMorphemes: prev.partialMorphemes.slice(0, index)
          .concat([{ l2, gloss: prev.partialMorphemes[index].gloss }])
          .concat(prev.partialMorphemes.slice(index + 1)),
      }
    })
    
  }

  onChangePartialMorphemeGloss = (e: any) => {
    const gloss = e.target.value
    const index = parseInt(e.target.getAttribute('data-index'), 10)
    this.setState(prev => ({
      partialMorphemes: prev.partialMorphemes.slice(0, index)
        .concat([{ l2: prev.partialMorphemes[index].l2, gloss }])
        .concat(prev.partialMorphemes.slice(index + 1))
        .concat((index === prev.partialMorphemes.length - 1) ?
          [{ l2: '', gloss: ''}] : []),
    }))
  }

  onClickGuessedMorpheme = (e: any) => {
    const index = parseInt(e.target.getAttribute('data-index'), 10)
    this.setState(prev => ({
      partialMorphemes: prev.partialMorphemes
        .slice(0, prev.partialMorphemes.length - 1) // overwrite the last
        .concat([{
          l2: prev.guessedMorphemes[index].l2,
          gloss: prev.guessedMorphemes[index].gloss,
        }, {
          l2: '',
          gloss: '',
        }]),
      guessedMorphemes: [],
    }))
  }

  onClickDeletePartialMorpheme = (e: any) => {
    const index = parseInt(e.target.getAttribute('data-index'), 10)
    this.setState(prev => ({
      partialMorphemes: prev.partialMorphemes
        .slice(0, index)
        .concat(prev.partialMorphemes.slice(index + 1)),
      guessedMorphemes: [],
    }))
  }

  onClickInsertPartialMorpheme = (e: any) => {
    const index = parseInt(e.target.getAttribute('data-index'), 10)
    this.setState(prev => ({
      partialMorphemes: prev.partialMorphemes
        .slice(0, index + 1)
        .concat([{ l2: '', gloss: '' }])
        .concat(prev.partialMorphemes.slice(index + 1)),
      guessedMorphemes: [],
    }))
  }

  onClickSave = () => {
    const { l1, l2, partialMorphemes } = this.state
    this.props.save({ ...this.props.card, l1, l2 }, partialMorphemes)
  }

  render() {
    const {
      l1,
      l2,
      guessedMorphemes,
      partialMorphemes,
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
          {partialMorphemes.map((m: PartialMorpheme, i: number) => <tr key={i}>
            <td>
              <input
                type='text'
                value={m.l2}
                data-index={i}
                onChange={this.onChangePartialMorphemeL2} />
            </td>
            <td>
              <input
                type='text'
                value={m.gloss}
                data-index={i}
                onChange={this.onChangePartialMorphemeGloss} />
            </td>
            <td>
              <button
                data-index={i}
                onClick={this.onClickDeletePartialMorpheme}
                disabled={i === partialMorphemes.length - 1}>Delete</button>
            </td>
            <td>
              <button
                data-index={i}
                onClick={this.onClickInsertPartialMorpheme}
                disabled={i === partialMorphemes.length - 1}>Insert</button>
            </td>
          </tr>)}
        </tbody>
      </table>

      <table style={{border: '1px black solid'}}>
        <tbody>
          {guessedMorphemes.map((m: Morpheme, i: number) =>
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
