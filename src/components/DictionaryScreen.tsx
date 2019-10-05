import {BackendProps} from '../backend/Backend'
import {DictionaryProps} from '../storage/DictionaryStorage'
import * as React from 'react'

interface Props {
  backend: BackendProps,
  log: (event: string, details?: {}) => void,
  dictionary: DictionaryProps,
}

interface State {
  query: string,
}

function highlightQuery(query: string, context: string): any {
  if (context.indexOf(query) === -1) { return context }
  return context.split(', ').map((en, i) =>
    (en.startsWith(query))
      ? <span key={i}>
          {(i > 0) ? <span>, </span> : null}
          <b>{query}</b>
          <span>{en.substr(query.length)}</span>
        </span>
      : <span key={i}>{(i > 0) ? ', ' : ''}{en}</span>
  )
}

export default class DictionaryScreen
    extends React.PureComponent<Props, State> {
  state = {
    query: '',
  }

  componentDidMount() {
    this.props.log('DictionaryScreen')
  }

  onChangeQuery = (e: any) => {
    const query = e.target.value
    this.setState({ query })
    this.props.dictionary.cacheLookupWordPairs(query)
  }

  onClickDownloadDictionary = () =>
    this.props.backend.downloadDictionary()
      .then(wordPairs => this.props.dictionary.saveDictionary(wordPairs))
      .catch(e => console.warn('Error downloading dictionary', e))

  render() {
    const { query } = this.state
    const wordPairs = this.props.dictionary.lookupWordPairs(query)

    return <div>
      <h2>Dictionary</h2>

      <button onClick={this.onClickDownloadDictionary}>Download</button>

      <p>
        <input
          value={query}
          onChange={this.onChangeQuery}
          placeholder='Enter 3 letters of Spanish or English here'
          size={40} />
      </p>

      {wordPairs !== null &&
        <table>
          <tbody>
            {wordPairs.map((wordPair, i) =>
              <tr key={i}>
                <td>{highlightQuery(query, wordPair.en)}</td>
                <td>{highlightQuery(query, wordPair.es)}</td>
              </tr>
            )}
          </tbody>
        </table>}
    </div>
  }
}
