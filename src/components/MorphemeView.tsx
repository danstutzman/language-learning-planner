import {Morpheme} from '../backend/Backend'
import * as React from 'react'

interface Props {
  close: () => void
  morpheme: Morpheme
  save: (morpheme: Morpheme) => Promise<Morpheme>
}

interface State {
  type: string
  l2: string
}

export default class MorphemeView extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    const { type, l2 } = props.morpheme
    this.state = { type, l2 }
  }

  onChangeL2 = (e: any) => {
    const l2 = e.target.value
    this.setState({ l2 })
  }

  onChangeType = (e: any) => {
    const type = e.target.value
    this.setState({ type })
  }

  onClickSave = () => {
    const { l2, type } = this.state
    this.props.save({ ...this.props.morpheme, l2, type })
  }

  render() {
    const { l2, type } = this.state

    return <div>
      <h2>
        Morpheme ID={this.props.morpheme.id}
        <button onClick={this.props.close}>X</button>
      </h2>

      <b>Type</b>
      <input type='text' value={type} onChange={this.onChangeType}/>
      <br/>

      <b>L2</b>
      <input type='text' value={l2} onChange={this.onChangeL2} autoFocus/>
      <br/>

      <button onClick={this.onClickSave}>Save</button>
    </div>
  }
}
