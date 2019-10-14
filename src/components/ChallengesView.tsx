import {Challenge} from '../backend/Backend'
import {ChallengeList} from '../backend/Backend'
import * as React from 'react'

export interface Props {
  challengeList: ChallengeList | void
}

export default class ChallengesView extends React.PureComponent<Props> {
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
            <th>Answered L1</th>
            <th>Answered L2</th>
            <th>Answered At</th>
            <th>Showed Mnemonic</th>
          </tr>
        </thead>
        <tbody>
          {challengeList ? null : <tr><td>Loading...</td></tr>}
          {challenges.map(challenge =>
            <tr key={challenge.id}>
              <td>{challenge.type}</td>
              <td>{challenge.card.l2}</td>
              <td>{challenge.answeredL1}</td>
              <td>{challenge.answeredL2}</td>
              <td>{challenge.answeredAt}</td>
              <td>{challenge.showedMnemonic ? 'true' : ''}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  }
}
