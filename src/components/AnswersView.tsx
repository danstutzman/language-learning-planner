import {Answer} from '../backend/Backend'
import {AnswerList} from '../backend/Backend'
import {AnswerUpdate} from '../backend/Backend'
import {AnswerMorpheme} from '../backend/Backend'
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

  renderMorphemes = (morphemes: Array<AnswerMorpheme>) =>
    <table>
      <tbody>
        <tr>
          {morphemes.map((morpheme, i) =>
            <td key={i}>{morpheme.correctL2}</td>)}
        </tr>
        <tr>
          {morphemes.map((morpheme, i) =>
            <td key={i}
              className={morpheme.alignedL2 === morpheme.correctL2 ?
              'match' : 'nonmatch'}>
              {morpheme.alignedL2}
            </td>)}
        </tr>
      </tbody>
    </table>

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
        <td>{this.renderMorphemes(answer.morphemes)}</td>
      </tr>
    })

  render() {
    const { answerList } = this.props
    const answers = answerList ? answerList.answers : []

    return <div className='AnswersView'>
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
            <th>Morphemes</th>
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
