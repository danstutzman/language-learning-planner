import {EMPTY_MORPHEME_LIST} from '../backend/Backend'
import {Morpheme} from '../backend/Backend'
import {MorphemeList} from '../backend/Backend'
import * as React from 'react'

interface Props {
  deleteRow: (numMorpheme: number) => void
  doneSettingFocus: () => void,
  guessMorphemes: (l2: string) => Promise<MorphemeList>
  insertRowAfter: (numMorpheme: number) => void
  isFocused: boolean,
  morpheme: Morpheme
  moveFocus: (numMorpheme: number) => void,
  numMorpheme: number
  updateMorpheme: (morpheme: Morpheme, numMorpheme: number) => void
}

interface State {
  guessedMorphemes: MorphemeList
  highlightedGuessNum: number,
}

export default class MorphemeRow extends React.PureComponent<Props, State> {
  l2Element: any

  constructor(props: Props) {
    super(props)
    this.state = {
      guessedMorphemes: EMPTY_MORPHEME_LIST,
      highlightedGuessNum: -1,
    }
  }

  componentDidMount() {
    if (this.props.isFocused) {
      this.l2Element.focus()
      this.props.doneSettingFocus()
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.isFocused && !prevProps.isFocused) {
      this.l2Element.focus()
      this.props.doneSettingFocus()
    }
  }

  hideGuesses = () =>
    this.setState({
      guessedMorphemes: EMPTY_MORPHEME_LIST,
      highlightedGuessNum: -1,
    })

  // Needs setTimeout so 'click' fires before 'blur'
  onBlurL2 = () =>
    setTimeout(this.hideGuesses, 100)

  onChangeL2 = (e: any) => {
    const l2 = e.target.value
    if (l2 !== '') {
      this.props.guessMorphemes(l2)
        .then(guessedMorphemes => this.setState({
          guessedMorphemes,
          highlightedGuessNum: -1,
        }))
    }
    this.props.updateMorpheme(
      { ...this.props.morpheme, l2 }, this.props.numMorpheme)
  }

  onChangeType = (e: any) =>
    this.props.updateMorpheme(
      { ...this.props.morpheme, type: e.target.value }, this.props.numMorpheme)

  onClickGuessed = (e: any) => {
    const index = parseInt(e.target.getAttribute('data-index'), 10)
    const morpheme = this.state.guessedMorphemes.morphemes[index]
    this.props.updateMorpheme(morpheme, this.props.numMorpheme)
    this.hideGuesses()
    this.props.moveFocus(this.props.numMorpheme)
  }

  onClickDelete = (e: any) => {
    this.hideGuesses()
    this.props.deleteRow(this.props.numMorpheme)
  }

  onClickInsert = (e: any) => {
    this.hideGuesses()
    this.props.insertRowAfter(this.props.numMorpheme)
  }

  onFocusL2 = () => {
    if (this.props.morpheme.l2 !== '') {
      this.props.guessMorphemes(this.props.morpheme.l2)
        .then(guessedMorphemes => this.setState({
          guessedMorphemes,
          highlightedGuessNum: -1,
        }))
    }
  }

  onKeyDown = (e: any) => {
    if (e.keyCode === 27) { // escape key
      this.hideGuesses()
    } else if (e.keyCode === 38) { // up arrow key
      this.setState(prev => ({
        highlightedGuessNum: prev.highlightedGuessNum - 1,
      }))
    } else if (e.keyCode === 40) { // down arrow key
      this.setState(prev => ({
        highlightedGuessNum: prev.highlightedGuessNum + 1,
      }))
    } else if (e.key === 'Tab' && !e.shiftKey &&
        this.state.highlightedGuessNum !== -1) {
      e.preventDefault()
      const morpheme = this.state.guessedMorphemes.morphemes[
        this.state.highlightedGuessNum]
      this.props.updateMorpheme(morpheme, this.props.numMorpheme)
      this.hideGuesses()
      this.props.moveFocus(this.props.numMorpheme)
    }
  }

  render() {
    const morphemes = this.state.guessedMorphemes ?
      this.state.guessedMorphemes.morphemes : []
    const showGuessedMorphemes = !(morphemes.length === 1
      && morphemes[0].id === this.props.morpheme.id)

    return <React.Fragment key={this.props.numMorpheme}>
      <tr key={this.props.numMorpheme}>
        <td>
          <input
            type='text'
            value={this.props.morpheme.type}
            onChange={this.onChangeType} />
        </td>
        <td>
          <input
            type='text'
            ref={(l2Element) => { this.l2Element = l2Element }}
            value={this.props.morpheme.l2}
            onBlur={this.onBlurL2}
            onChange={this.onChangeL2}
            onFocus={this.onFocusL2}
            onKeyDown={this.onKeyDown} />
        </td>
        <td>
          <button onClick={this.onClickDelete}>Delete</button>
        </td>
        <td>
          <button onClick={this.onClickInsert}>Insert</button>
        </td>
      </tr>

      {showGuessedMorphemes && morphemes.map((m: Morpheme, i: number) =>
        <tr key={i} className={'darken-on-hover ' +
            (i === this.state.highlightedGuessNum ? 'highlighted' : '')}>
          <td onClick={this.onClickGuessed} data-index={i}>
            {m.type}
          </td>
          <td onClick={this.onClickGuessed} data-index={i}>
            {m.l2}
          </td>
        </tr>)}
    </React.Fragment>
  }
}