import * as React from 'react'
import {Card} from '../backend/Backend'
import './CardView.css'
import {EMPTY_MORPHEME} from '../backend/Backend'
import {Morpheme} from '../backend/Backend'
import {MorphemeList} from '../backend/Backend'
import MorphemeRow from './MorphemeRow'

interface Props {
  close: () => void
  card: Card
  guessMorphemes: (l2Prefix: string, allL2: string) => Promise<MorphemeList>
  save: (card: Card) => Promise<Card>
}

interface State {
  focusedNumMorpheme: number
  l1: string
  l2: string
  morphemes: Array<Morpheme>
}

export default class CardView extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    const { l1, l2 } = props.card
    this.state = {
      focusedNumMorpheme: -1,
      l1,
      l2,
      morphemes: props.card.morphemes.concat([{ l2: '', gloss: '' }]),
    }
  }

  doneSettingFocus = () =>
    this.setState({ focusedNumMorpheme: -1 })

  guessMorphemes = (l2Prefix: string) =>
    this.props.guessMorphemes(l2Prefix, this.state.l2)

  moveFocus = (numMorpheme: number) =>
    this.setState({ focusedNumMorpheme: numMorpheme + 1 })

  onChangeL1 = (e: any) => {
    const l1 = e.target.value
    this.setState({ l1 })
  }

  onChangeL2 = (e: any) => {
    const l2 = e.target.value
    this.setState({ l2 })
  }

  updateMorpheme = (morpheme: Morpheme, numMorpheme: number) => {
    this.setState(prev => ({
      morphemes: prev.morphemes.slice(0, numMorpheme)
        .concat([morpheme])
        .concat(prev.morphemes.slice(numMorpheme + 1))
        .concat((numMorpheme === prev.morphemes.length - 1) ?
           [EMPTY_MORPHEME] : []),
    }))
  }

  onClickDeleteMorpheme = (numMorpheme: number) =>
    this.setState(prev => ({
      morphemes: prev.morphemes
        .slice(0, numMorpheme)
        .concat(prev.morphemes.slice(numMorpheme + 1)),
    }))

  onClickInsertMorpheme = (numMorpheme: number) =>
    this.setState(prev => ({
      morphemes: prev.morphemes
        .slice(0, numMorpheme + 1)
        .concat([EMPTY_MORPHEME])
        .concat(prev.morphemes.slice(numMorpheme + 1)),
    }))

  onClickSave = () => {
    const { l1, l2, morphemes } = this.state
    this.props.save({ ...this.props.card, l1, l2, morphemes })
  }

  render() {
    const { l1, l2, morphemes } = this.state
    const { card, close } = this.props

    return <div>
      <h2>
        Card
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
          {morphemes.map((m: Morpheme, i: number) =>
            <MorphemeRow
              deleteRow={this.onClickDeleteMorpheme}
              doneSettingFocus={this.doneSettingFocus}
              guessMorphemes={this.guessMorphemes}
              morpheme={m}
              insertRowAfter={this.onClickInsertMorpheme}
              isFocused={i == this.state.focusedNumMorpheme}
              isLast={i == morphemes.length - 1}
              key={i}
              moveFocus={this.moveFocus}
              numMorpheme={i}
              updateMorpheme={this.updateMorpheme} />)}
        </tbody>
      </table>

      <button onClick={this.onClickSave}>Save</button>
    </div>
  }
}
