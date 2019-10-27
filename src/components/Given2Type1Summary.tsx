import {ChallengeList} from '../backend/Backend'
import {ChallengeUpdate} from '../backend/Backend'
import Given2Type1 from './Given2Type1'
import './Given2Type1Summary.css'
import * as React from 'react'

interface Props {
  challengeList: ChallengeList
  initSynthesizer: () => Promise<void>,
  speakL2: (l2: string) => void,
  updateChallenge: (update: ChallengeUpdate) => Promise<void>,
}

interface State {
  isSynthesizerInitialized: boolean,
  numChallenge: number | null,
}

export default class Given2Type1Summary
  extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      isSynthesizerInitialized: false,
      numChallenge: null,
    }
  }

  componentDidMount() {
    this.props.initSynthesizer()
      .then(() => this.setState({ isSynthesizerInitialized: true }))
  }

  onClickShowChallenge = () =>
    this.setState({ numChallenge: 0 })

  updateChallengeAndAdvance = (update: ChallengeUpdate) => {
    this.props.updateChallenge(update)
    this.setState(prev => ({ numChallenge: prev.numChallenge + 1 }))
  }
    
  render() {
    const { numChallenge } = this.state
    const { challengeList } = this.props
    const challenges = challengeList.challenges

    return <div className='Given2Type1Summary'>
      <h1>Given2Type1 Summary</h1>

      <div>
        Current challenge: {numChallenge}/{challenges.length}
      </div>

      {!this.state.isSynthesizerInitialized && "Waiting for text-to-speech..."}

      {this.state.numChallenge == null &&
        <button onClick={this.onClickShowChallenge}
          disabled={!this.state.isSynthesizerInitialized}>
          Show challenge
        </button>}

      {this.state.numChallenge != null &&
        numChallenge < challenges.length &&
        <Given2Type1 challenge={challenges[numChallenge]}
          speakL2={this.props.speakL2}
          updateChallengeAndAdvance={this.updateChallengeAndAdvance} />}
    </div>
  }
}