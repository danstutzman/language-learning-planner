import {Morpheme} from '../storage/MorphemesStorage'
import {MorphemeList} from '../backend/Backend'
import {MorphemesProps} from '../storage/MorphemesStorage'
import * as React from 'react'

export interface Props {
  history: any,
  morphemeList: MorphemeList | void
}

export default class MorphemesView extends React.PureComponent<Props> {

  onClickMorpheme = (e: any) => {
    const id = e.currentTarget.getAttribute('data-id')
    this.props.history.push(`/morphemes/${id}`)
  }

  onClickNewMorpheme = () => {
    // this.props.morphemes.createMorpheme().then(morpheme =>
    //   this.props.history.push(`/morphemes/${morpheme.id}`)
    // )
  }

  onClickDelete = (e: any) => {
    // e.stopPropagation()
    // const id: number = parseInt(e.target.getAttribute('data-id'), 10)
    // this.props.morphemes.deleteMorpheme(id)
  }

  render() {
    const { morphemeList } = this.props
    const morphemes = morphemeList ? morphemeList.morphemes : []

    return <div>
      <h2>Morphemes</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>L2</th>
            <th>Gloss</th>
            <th>CreatedAt</th>
            <th>UpdatedAt</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {morphemeList ? null : <tr><td>Loading...</td></tr>}
          {morphemes.map(morpheme =>
            <tr
              key={morpheme.id}
              className="darken-on-hover"
              onClick={this.onClickMorpheme}
              data-id={morpheme.id}>
              <td>{morpheme.id}</td>
              <td>{morpheme.l2}</td>
              <td>{morpheme.gloss}</td>
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
