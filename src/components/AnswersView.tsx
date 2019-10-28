import {Answer} from '../backend/Backend'
import {AnswerList} from '../backend/Backend'
import {AnswerUpdate} from '../backend/Backend'
import './AnswersView.css'
import * as React from 'react'

export interface Props {
  answerList: AnswerList | void
  updateAnswer: (update: AnswerUpdate) => Promise<void>,
}

export default class AnswersView extends React.PureComponent<Props> {
  findAnswerByDataId = (e: any): Answer => {
    const { answerList } = this.props
    const id: number = parseInt(e.target.getAttribute('data-id'), 10)
    const answers = answerList ? answerList.answers : []
    const answer = answers.find(a => a.id === id)
    return answer
  }

  onClickMisconnected = (e: any) => {
    const answer = this.findAnswerByDataId(e)
    const grade = answer.showedMnemonic ?
      'MISCONNECTED_WITH_MNEMONIC' : 'MISCONNECTED_WITHOUT_MNEMONIC'
    const misconnectedCardId = parseInt(window.prompt(
      'Enter ID for card that was wrongly connected'), 10)
    if (!Number.isNaN(misconnectedCardId)) {
      this.props.updateAnswer({
        id: answer.id,
        cardId: answer.cardId,
        grade,
        misconnectedCardId,
      })
    }
  }

  onClickRight = (e: any) => {
    const answer = this.findAnswerByDataId(e)
    const grade = answer.showedMnemonic ?
      'RIGHT_WITH_MNEMONIC' : 'RIGHT_WITHOUT_MNEMONIC'
    this.props.updateAnswer({
      id: answer.id,
      cardId: answer.cardId,
      grade,
    })
  }

  onClickWrong = (e: any) => {
    const answer = this.findAnswerByDataId(e)
    const grade = answer.showedMnemonic ?
      'WRONG_WITH_MNEMONIC' : 'WRONG_WITHOUT_MNEMONIC'
    this.props.updateAnswer({
      id: answer.id,
      cardId: answer.cardId,
      grade,
    })
  }

  renderGradeFields(answer: Answer) {
    if (answer.grade) {
      return answer.grade
    } else if (answer.shownAt) {
      return <div>
        <button data-id={answer.id}
          onClick={this.onClickRight}>Right</button>
        <button data-id={answer.id}
          onClick={this.onClickMisconnected}>Misconnected</button>
      </div>
    } else if (answer.showedMnemonic !== null) {
      return answer.showedMnemonic ?
        <div>showed mnemonic :-(</div> :
        <div>quick answer :-)</div>
    }
  }

  renderAnswerRows = (answers: Array<Answer>) =>
    answers.map((answer: Answer, i: number) => {
      const className = (i === 0 ||
        answer.card.id !== answers[i - 1].card.id) ?
        'first-for-card-id' : ''
      return <tr key={answer.id} className={className}>
        <td>{answer.type}</td>
        <td>{answer.card.l2}</td>
        <td>{answer.card.l1}</td>
        <td className='shown-at'>{answer.shownAt}</td>
        <td>{answer.answeredL1}</td>
        <td>{answer.answeredL2}</td>
        <td className='grade'>{this.renderGradeFields(answer)}</td>
      </tr>
    })

  render() {
    const { answerList } = this.props
    const answers = answerList ? answerList.answers : []

    return <div>
      <h2>Answers</h2>

      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Card L2</th>
            <th>Card L1</th>
            <th className='shown-at'>Shown At</th>
            <th>Answered L1</th>
            <th>Answered L2</th>
            <th className='grade'>Grade</th>
          </tr>
        </thead>
        <tbody>
          {answerList ? null : <tr><td>Loading...</td></tr>}
          {this.renderAnswerRows(answers)}
       </tbody>
      </table>
    </div>
  }
}
