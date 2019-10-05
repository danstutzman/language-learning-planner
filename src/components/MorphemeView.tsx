import {Morpheme} from '../storage/MorphemesStorage'
import * as React from 'react'

interface Props {
  close: () => void
  morpheme: Morpheme
  save: (morpheme: Morpheme) => Promise<Morpheme>
}

interface State {
  l2: string
  gloss: string
}

export default class MorphemeView extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    const { l2, gloss } = props.morpheme
    this.state = { l2, gloss }
  }

  onChangeL2 = (e: any) => {
    const l2 = e.target.value
    this.setState({ l2 })
  }

  onChangeGloss = (e: any) => {
    const gloss = e.target.value
    this.setState({ gloss })
  }

  onClickSave = () => {
    const { l2, gloss } = this.state
    this.props.save({ ...this.props.morpheme, l2, gloss })
  }

  render() {
    const { l2, gloss } = this.state

    return <div>
      <h2>
        Morpheme ID={this.props.morpheme.id}
        <button onClick={this.props.close}>X</button>
      </h2>

      <b>L2</b>
      <input type='text' value={l2} onChange={this.onChangeL2}/>
      <br/>

      <b>Gloss</b>
      <input type='text' value={gloss} onChange={this.onChangeGloss}/>
      <br/>

      <button onClick={this.onClickSave}>Save</button>
    </div>
  }
}
