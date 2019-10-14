import {Challenge} from '../backend/Backend'
import {ChallengeUpdate} from '../backend/Backend'
import {ChallengeList} from '../backend/Backend'
import * as React from 'react'

export interface Props {
  challengeList: ChallengeList | void
  updateChallenge: (update: ChallengeUpdate) => Promise<void>,
}

export default class ChallengesView extends React.PureComponent<Props> {
  updateChallenge(id: number, grade: string) {
    const { challengeList } = this.props
    const challenges = challengeList ? challengeList.challenges : []
    const challenge = challenges.find(c => c.id === id)
    this.props.updateChallenge({
      id: challenge.id,
      grade,
    })
  }

  onClickRight = (e: any) => {
    const id: number = parseInt(e.target.getAttribute('data-id'), 10)
    this.updateChallenge(id, 'RIGHT')
  }

  onClickWrong = (e: any) => {
    const id: number = parseInt(e.target.getAttribute('data-id'), 10)
    this.updateChallenge(id, 'WRONG')
  }

  renderGradeFields(challenge: Challenge) {
    if (challenge.grade) {
      return challenge.grade
    } else if (challenge.answeredAt) {
      return <div>
        <button data-id={challenge.id}
          onClick={this.onClickRight}>Right</button>
        <button data-id={challenge.id}
          onClick={this.onClickWrong}>Wrong</button>
      </div>
    } else if (challenge.showedMnemonic !== null) {
      return challenge.showedMnemonic ?
        <div>showed mnemonic :-(</div> :
        <div>quick answer :-)</div>
    }
  }

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
            <th>Hide Until</th>
            <th>|</th>
            <th>Answered At</th>
            <th>Answered L1</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {challengeList ? null : <tr><td>Loading...</td></tr>}
          {challenges.map(challenge =>
            <tr key={challenge.id}>
              <td>{challenge.type}</td>
              <td>{challenge.card.l2}</td>
              <td>{challenge.card.l1}</td>
              <td>{challenge.expectation}</td>
              <td>{challenge.hideUntil}</td>
              <td>|</td>
              <td>{challenge.answeredAt}</td>
              <td>{challenge.answeredL1}</td>
              <td>{this.renderGradeFields(challenge)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  }
}
