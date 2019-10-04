import * as React from 'react'
import {Note} from '../NotesStorage'

interface Props {
  close: () => void
  note: Note
  save: (note: Note) => Promise<Note>
}

interface State {
  text: string
}

export default class NoteView extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      text: props.note.text,
    }
  }

  onChangeText = (e: any) => {
    const text = e.target.value
    this.setState({ text })
  }

  onClickSave = () => {
    this.props.save({
      ...this.props.note,
      text: this.state.text,
    })
  }

  render() {
    const { text } = this.state
    return <div>
      <h2>
        Note ID={this.props.note.id}
        <button onClick={this.props.close}>X</button>
      </h2>

      <b>Text</b><br/>
      <textarea value={text} onChange={this.onChangeText}></textarea>

      <button onClick={this.onClickSave}>Save</button>
    </div>
  }
}
