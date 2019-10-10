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
  guessMorphemes: (l2Prefix: string) => Promise<MorphemeList>
  parseL2Phrase: (l2: string) => Promise<MorphemeList>
  save: (card: Card) => Promise<Card>
}

interface State {
  focusedNumMorpheme: number
  l2: string
  morphemes: Array<Morpheme>
}

export default class CardView extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    const { l2, morphemes } = props.card
    this.state = { l2, morphemes, focusedNumMorpheme: -1 }
  }

  doneSettingFocus = () =>
    this.setState({ focusedNumMorpheme: -1 })

  moveFocus = (numMorpheme: number) =>
    this.setState({ focusedNumMorpheme: numMorpheme + 1 })

  onBlurL2 = () => {
    const { morphemes, l2 } = this.state
    if (l2 !== '' &&
      (morphemes.length === 0 ||
       morphemes.length === 1 && !morphemes[0].l2 && !morphemes[0].type)) {
      this.props.parseL2Phrase(l2).then(morphemeList =>
        this.setState({ morphemes: morphemeList.morphemes }))
    }
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
    const { l2, morphemes } = this.state
    this.props.save({ ...this.props.card, l2, morphemes })
  }

  render() {
    const { l2 } = this.state
    const { card, close } = this.props

    // You need at least one morpheme to get started; otherwise there's
    // no Insert button to make your first morpheme.
    let morphemes = this.state.morphemes.length ?
      this.state.morphemes : [EMPTY_MORPHEME]

    return <div>
      <h2>
        Card
        <button onClick={close}>X</button>
      </h2>

      <b>L2</b>
      <input
        type='text'
        value={l2}
        onBlur={this.onBlurL2}
        onChange={this.onChangeL2} />
      <br/>

      <b>Morphemes</b>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>L2</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {morphemes.map((m: Morpheme, i: number) =>
            <MorphemeRow
              deleteRow={this.onClickDeleteMorpheme}
              doneSettingFocus={this.doneSettingFocus}
              guessMorphemes={this.props.guessMorphemes}
              morpheme={m}
              insertRowAfter={this.onClickInsertMorpheme}
              isFocused={i == this.state.focusedNumMorpheme}
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
