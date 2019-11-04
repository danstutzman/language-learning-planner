import * as React from 'react'
import './PredictiveInput.css'

interface Props {
  onBlur: () => void
  setValue: (value: string) => void
  predictText: (wordSoFar: string) => Promise<Array<string>>
  value: string
}

interface State {
  textBeforeCurrentWord: string
  predictions: Array<string>
  selectedPredictionNum: null | number,
}

export default class PredictiveInput
  extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      textBeforeCurrentWord: '',
      predictions: [],
      selectedPredictionNum: null,
    }
  }

  onBlur = () =>
    this.props.onBlur()

  onChangeText = (e: any) => {
    const text = e.target.value
    const lastSpace = text.lastIndexOf(' ')
    const textBeforeCurrentWord = text.substring(0, lastSpace + 1)
    const currentWord = text.substring(lastSpace + 1)

    this.setState({ textBeforeCurrentWord })
    if (currentWord === '') {
      this.setState({ predictions: [] })
    } else {
      this.props.predictText(currentWord)
        .then(predictions =>
          this.setState({ predictions, selectedPredictionNum: null }))
    }

    this.props.setValue(text)
  }

  onKeyDown = (e: any) => {
    const numberKey = parseInt(e.key, 10)
    if (numberKey >= 1 && numberKey <= 6) {
      e.preventDefault()
      this.approvePrediction(numberKey - 1)
    } else if (e.keyCode === 27) { // escape key
      this.setState({ predictions: [] })
    } else if (e.keyCode === 38) { // up arrow key
      this.setState(prev => ({
        selectedPredictionNum: prev.selectedPredictionNum - 1,
      }))
    } else if (e.keyCode === 40) { // down arrow key
      this.setState(prev => ({
        selectedPredictionNum: prev.selectedPredictionNum === null ?
          0 : (prev.selectedPredictionNum + 1),
      }))
    } else if (e.key === 'Tab' && !e.shiftKey &&
        this.state.selectedPredictionNum !== null) {
      e.preventDefault()
      this.approvePrediction(this.state.selectedPredictionNum)
    }
  }

  approvePrediction = (predictionNum: number) =>
    this.setState(prev => {
      const text = this.props.value
      const lastSpace = text.lastIndexOf(' ')
      const textBeforeCurrentWord = text.substring(0, lastSpace + 1)
      const selectedWord = prev.predictions[predictionNum]
      this.props.setValue(textBeforeCurrentWord + selectedWord + ' ')
      return { predictions: [] }
    })

  onHoverOverPrediction = (e: any) => {
    const td = e.target
    const tr = td.parentElement
    const selectedPredictionNum =
      parseInt(tr.getAttribute('data-prediction-num'), 10)
    this.setState({ selectedPredictionNum })
  }

  render() {
    const {
      predictions,
      selectedPredictionNum,
      textBeforeCurrentWord,
    } = this.state

    return <div className='PredictiveInput'>
      <input autoFocus={true} 
        onBlur={this.onBlur}
        onChange={this.onChangeText}
        onKeyDown={this.onKeyDown}
        value={this.props.value} />
      <br/>
      <span className='hidden'>{textBeforeCurrentWord}</span>
      <div className='position-relative-placeholder'>
        {predictions.length > 0 &&
          <table className='dropdown'>
            <tbody>
              {predictions.map((possibility, i) =>
                <tr key={i}
                  data-prediction-num={i}
                  className={selectedPredictionNum === i ? 'selected' : ''}
                  onMouseEnter={this.onHoverOverPrediction}>
                  <td className='shortcut'>{i + 1}</td>
                  <td>{possibility}</td>
                </tr>
              )}
            </tbody>
          </table>}
      </div>
    </div>
  }
}