import {Skill} from '../backend/Backend'
import {SkillList} from '../backend/Backend'
import * as React from 'react'

export interface Props {
  skillList: SkillList
}

export default class SkillsView extends React.PureComponent<Props> {
  render() {
    const { skillList } = this.props
    const skills = skillList ? skillList.skills : []

    return <div>
      <h2>Skills</h2>

      <table>
        <thead>
          <tr>
            <th>Card L1</th>
            <th>State</th>
            <th>Num Failures</th>
          </tr>
        </thead>
        <tbody>
          {skillList ? null : <tr><td>Loading...</td></tr>}
          {skills.map((skill: Skill, i: number) =>
            <tr key={i}>
              <td>{skill.card.l1}</td>
              <td>{skill.state}</td>
              <td>{skill.numFailures}</td>
            </tr>)}
        </tbody>
      </table>
    </div>
  }
}