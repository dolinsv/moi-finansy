import type { FundType } from '../types'
import { fundTypeLabel } from '../utils'

interface FundTypeFieldsProps {
  fundType: FundType
  cardId: string
  cards: { id: string; name: string; last4: string }[]
  onFundTypeChange: (value: FundType) => void
  onCardChange: (value: string) => void
}

export function FundTypeFields({
  fundType,
  cardId,
  cards,
  onFundTypeChange,
  onCardChange,
}: FundTypeFieldsProps) {
  return (
    <>
      <label className="field">
        <span>Вид средств</span>
        <select
          value={fundType}
          onChange={(e) => onFundTypeChange(e.target.value as FundType)}
          required
        >
          <option value="cash">{fundTypeLabel('cash')}</option>
          <option value="card">{fundTypeLabel('card')}</option>
          <option value="account">{fundTypeLabel('account')}</option>
        </select>
      </label>
      {fundType === 'card' ? (
        <label className="field">
          <span>Карта</span>
          <select
            value={cardId}
            onChange={(e) => onCardChange(e.target.value)}
            required
          >
            <option value="">Выберите карту</option>
            {cards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name} •••• {card.last4}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </>
  )
}
