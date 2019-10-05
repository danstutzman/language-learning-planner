import * as React from 'react'
import {Morpheme} from '../MorphemesStorage'

interface Props {
  close: () => void
  morpheme: Morpheme
  save: (morpheme: Morpheme) => Promise<Morpheme>
}

interface State {
  l2: string
}

export default class MorphemeView extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      l2: props.morpheme.l2,
    }
  }

  onChangeL2 = (e: any) => {
    const l2 = e.target.value
    this.setState({ l2 })
  }

  onClickSave = () => {
    this.props.save({
      ...this.props.morpheme,
      l2: this.state.l2,
    })
  }

  render() {
    const { l2 } = this.state
    return <div>
      <h2>
        Morpheme ID={this.props.morpheme.id}
        <button onClick={this.props.close}>X</button>
      </h2>

      <b>L2</b><br/>
      <textarea value={l2} onChange={this.onChangeL2}></textarea>

      <button onClick={this.onClickSave}>Save</button>
    </div>
  }
}
