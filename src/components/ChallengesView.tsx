import {Challenge} from '../backend/Backend'
import {ChallengeUpdate} from '../backend/Backend'
import {ChallengeList} from '../backend/Backend'
import './ChallengesView.css'
import * as React from 'react'

export interface Props {
  challengeList: ChallengeList | void
  updateChallenge: (update: ChallengeUpdate) => Promise<void>,
}

export default class ChallengesView extends React.PureComponent<Props> {
  findChallengeByDataId = (e: any): Challenge => {
    const { challengeList } = this.props
    const id: number = parseInt(e.target.getAttribute('data-id'), 10)
    const challenges = challengeList ? challengeList.challenges : []
    const challenge = challenges.find(c => c.id === id)
    return challenge
  }

  onClickMisconnected = (e: any) => {
    const challenge = this.findChallengeByDataId(e)
    const grade = challenge.showedMnemonic ?
      'MISCONNECTED_WITH_MNEMONIC' : 'MISCONNECTED_WITHOUT_MNEMONIC'
    const misconnectedCardId = parseInt(window.prompt(
      'Enter ID for card that was wrongly connected'), 10)
    if (!Number.isNaN(misconnectedCardId)) {
      this.props.updateChallenge({
        id: challenge.id,
        grade,
        misconnectedCardId,
      })
    }
  }

  onClickRight = (e: any) => {
    const challenge = this.findChallengeByDataId(e)
    const grade = challenge.showedMnemonic ?
      'RIGHT_WITH_MNEMONIC' : 'RIGHT_WITHOUT_MNEMONIC'
    this.props.updateChallenge({ id: challenge.id, grade })
  }

  onClickWrong = (e: any) => {
    const challenge = this.findChallengeByDataId(e)
    const grade = challenge.showedMnemonic ?
      'WRONG_WITH_MNEMONIC' : 'WRONG_WITHOUT_MNEMONIC'
    this.props.updateChallenge({ id: challenge.id, grade })
  }

  renderGradeFields(challenge: Challenge) {
    if (challenge.grade) {
      return challenge.grade
    } else if (challenge.shownAt) {
      return <div>
        <button data-id={challenge.id}
          onClick={this.onClickRight}>Right</button>
        <button data-id={challenge.id}
          onClick={this.onClickMisconnected}>Misconnected</button>
      </div>
    } else if (challenge.showedMnemonic !== null) {
      return challenge.showedMnemonic ?
        <div>showed mnemonic :-(</div> :
        <div>quick answer :-)</div>
    }
  }

  renderChallengeRows = (challenges: Array<Challenge>) =>
    challenges.map((challenge: Challenge, i: number) => {
      const className = (i === 0 ||
        challenge.card.id !== challenges[i - 1].card.id) ?
        'first-for-card-id' : ''
      return <tr key={challenge.id} className={className}>
        <td>{challenge.type}</td>
        <td>{challenge.card.l2}</td>
        <td>{challenge.card.l1}</td>
        <td>{challenge.expectation}</td>
        <td className='shown-at'>{challenge.shownAt}</td>
        <td>{challenge.answeredL1}</td>
        <td>{challenge.answeredL2}</td>
        <td className='grade'>{this.renderGradeFields(challenge)}</td>
      </tr>
    })

  render() {
    const { challengeList } = this.props
    const challenges = challengeList ? challengeList.challenges : []

    return <div>
      <h2>Challenges</h2>

      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Card L2</th>
            <th>Card L1</th>
            <th>Expectation</th>
            <th className='shown-at'>Shown At</th>
            <th>Answered L1</th>
            <th>Answered L2</th>
            <th className='grade'>Grade</th>
          </tr>
        </thead>
        <tbody>
          {challengeList ? null : <tr><td>Loading...</td></tr>}
          {this.renderChallengeRows(challenges)}
       </tbody>
      </table>
    </div>
  }
}
