import {Answer} from '../backend/Backend'
import {AnswerList} from '../backend/Backend'
import * as React from 'react'

export interface Props {
  answerList: AnswerList | void
}

export default class AnswersView extends React.PureComponent<Props> {
  render() {
    const { answerList } = this.props
    const answers = answerList ? answerList.answers : []

    return <div>
      <h2>Answers</h2>

      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Card ID</th>
            <th>Answered L2</th>
            <th>Answered At</th>
            <th>Showed Mnemonic</th>
          </tr>
        </thead>
        <tbody>
          {answerList ? null : <tr><td>Loading...</td></tr>}
          {answers.map(answer =>
            <tr key={answer.id}>
              <td>{answer.type}</td>
              <td>{answer.cardId}</td>
              <td>{answer.answeredL2}</td>
              <td>{answer.answeredAt}</td>
              <td>{answer.showedMnemonic ? 'true' : ''}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  }
}
