import {Card} from '../storage/CardsStorage'
import {CardList} from '../backend/Backend'
import './CardsView.css'
import * as React from 'react'

export interface Props {
  history: any,
  cardList: CardList | void
}

export default class CardsView extends React.PureComponent<Props> {
  onClickCard = (e: any) => {
    const id = e.currentTarget.getAttribute('data-id')
    this.props.history.push(`/cards/${id}`)
  }

  onClickNewCard = () => {
    // this.props.cards.createCard().then(card =>
    //   this.props.history.push(`/cards/${card.id}`)
    // )
  }

  onClickDelete = (e: any) => {
    // e.stopPropagation()
    // const id: number = parseInt(e.target.getAttribute('data-id'), 10)
    // this.props.cards.deleteCard(id)
  }

  render() {
    const { cardList } = this.props
    const cards = cardList ? cardList.cards : []

    return <div>
      <h2>Cards</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>L1</th>
            <th>L2</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {cardList ? null : <tr><td>Loading...</td></tr>}
          {cards.map(card =>
            <tr
              key={card.id}
              className="darken-on-hover"
              onClick={this.onClickCard}
              data-id={card.id}>
              <td>{card.id}</td>
              <td>{card.l1}</td>
              <td>{card.l2}</td>
              <td>
                <button onClick={this.onClickDelete} data-id={card.id}>
                  Delete
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button onClick={this.onClickNewCard}>New Card</button>
    </div>
  }
}
