import {Morpheme} from '../MorphemesStorage'
import {MorphemesProps} from '../MorphemesStorage'
import * as React from 'react'

export interface MorphemesViewProps {
  history: any,
  morphemes: MorphemesProps
}

export default class MorphemesView extends React.PureComponent<MorphemesViewProps> {
  onClickMorpheme = (e: any) => {
    const id = e.currentTarget.getAttribute('data-id')
    this.props.history.push(`/morphemes/${id}`)
  }

  onClickNewMorpheme = () => {
    this.props.morphemes.createMorpheme().then(morpheme =>
      this.props.history.push(`/morphemes/${morpheme.id}`)
    )
  }

  onClickDelete = (e: any) => {
    e.stopPropagation()
    const id: number = parseInt(e.target.getAttribute('data-id'), 10)
    this.props.morphemes.deleteMorpheme(id)
  }

  render() {
    const morphemes: Array<Morpheme> =
      Object.values(this.props.morphemes.morphemeById)
    return <div>
      <h2>Morphemes</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>L2</th>
            <th>CreatedAt</th>
            <th>UpdatedAt</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {morphemes.map(morpheme =>
            <tr
              key={morpheme.id}
              className="darken-on-hover"
              onClick={this.onClickMorpheme}
              data-id={morpheme.id}>
              <td>{morpheme.id}</td>
              <td>{morpheme.l2}</td>
              <td>{morpheme.createdAtMillis}</td>
              <td>{morpheme.updatedAtMillis}</td>
              <td>
                <button onClick={this.onClickDelete} data-id={morpheme.id}>
                  Delete
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button onClick={this.onClickNewMorpheme}>New Morpheme</button>
    </div>
  }
}
