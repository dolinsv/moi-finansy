import { useMemo, useState } from 'react'
import { FundTypeFields } from '../components/FundTypeFields'
import { Modal } from '../components/Modal'
import { MoneyInput } from '../components/MoneyInput'
import { PageHeader } from '../components/PageHeader'
import { RowActions } from '../components/RowActions'
import { useFinance } from '../FinanceContext'
import type { FundType, Income } from '../types'
import {
  formatDate,
  formatDocNumber,
  formatMoney,
  fundTypeLabel,
  parseMoney,
  todayIso,
  toMoneyInput,
} from '../utils'

const emptyForm = () => ({
  date: todayIso(),
  memberId: '',
  incomeTypeId: '',
  fundType: 'cash' as FundType,
  cardId: '',
  amount: '',
  comment: '',
})

export function IncomesPage() {
  const { data, addIncome, updateIncome, removeIncome } = useFinance()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Income | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [typeFilter, setTypeFilter] = useState('')
  const [memberFilter, setMemberFilter] = useState('')

  const memberMap = useMemo(
    () => Object.fromEntries(data.members.map((m) => [m.id, m.name])),
    [data.members],
  )
  const typeMap = useMemo(
    () => Object.fromEntries(data.incomeTypes.map((t) => [t.id, t.name])),
    [data.incomeTypes],
  )
  const cardMap = useMemo(
    () =>
      Object.fromEntries(
        data.cards.map((c) => [c.id, `${c.name} •••• ${c.last4}`]),
      ),
    [data.cards],
  )

  const rows = useMemo(() => {
    return [...data.incomes]
      .filter((item) => !typeFilter || item.incomeTypeId === typeFilter)
      .filter((item) => !memberFilter || item.memberId === memberFilter)
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date)
        return b.number - a.number
      })
  }, [data.incomes, typeFilter, memberFilter])

  const total = useMemo(() => rows.reduce((sum, item) => sum + item.amount, 0), [rows])

  const openCreate = () => {
    setEditing(null)
    setForm({
      ...emptyForm(),
      memberId: data.members[0]?.id ?? '',
      incomeTypeId: typeFilter || data.incomeTypes[0]?.id || '',
    })
    setOpen(true)
  }

  const openEdit = (item: Income) => {
    setEditing(item)
    setForm({
      date: item.date,
      memberId: item.memberId,
      incomeTypeId: item.incomeTypeId,
      fundType: item.fundType,
      cardId: item.cardId ?? '',
      amount: toMoneyInput(item.amount),
      comment: item.comment ?? '',
    })
    setOpen(true)
  }

  const openCopy = (item: Income) => {
    setEditing(null)
    setForm({
      date: todayIso(),
      memberId: item.memberId,
      incomeTypeId: item.incomeTypeId,
      fundType: item.fundType,
      cardId: item.cardId ?? '',
      amount: toMoneyInput(item.amount),
      comment: item.comment ?? '',
    })
    setOpen(true)
  }

  const save = () => {
    const amount = parseMoney(form.amount)
    if (!amount || amount <= 0) return
    if (form.fundType === 'card' && !form.cardId) return

    const payload = {
      date: form.date,
      memberId: form.memberId,
      incomeTypeId: form.incomeTypeId,
      fundType: form.fundType,
      cardId: form.fundType === 'card' ? form.cardId : undefined,
      amount,
      comment: form.comment.trim() || undefined,
    }

    if (editing) updateIncome({ ...payload, id: editing.id, number: editing.number })
    else addIncome(payload)
    setOpen(false)
  }

  return (
    <div className="page fade-in">
      <PageHeader
        title="Приходы"
        subtitle="Журнал документов поступлений"
        action={
          <button type="button" className="btn primary" onClick={openCreate}>
            Новый приход
          </button>
        }
      />

      <div className="journal-filters">
        <label className="field">
          <span>Вид дохода</span>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">Все</option>
            {data.incomeTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Член семьи</span>
          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
          >
            <option value="">Все</option>
            {data.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <div className="journal-total">
          <span>Итого</span>
          <strong className="money up">{formatMoney(total)}</strong>
        </div>
      </div>

      <div className="table-wrap journal-table">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Номер</th>
              <th>Дата</th>
              <th>Член семьи</th>
              <th>Вид дохода</th>
              <th>Тип денег</th>
              <th className="money-col">Сумма</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty">
                  {data.incomes.length === 0
                    ? 'Пока нет приходов. Создайте первый документ.'
                    : 'Нет документов по выбранным фильтрам.'}
                </td>
              </tr>
            ) : (
              rows.map((item) => (
                <tr key={item.id}>
                  <td data-label="Номер" className="doc-number">
                    {formatDocNumber(item.number)}
                  </td>
                  <td data-label="Дата">{formatDate(item.date)}</td>
                  <td data-label="Член семьи">
                    {memberMap[item.memberId] ?? '—'}
                  </td>
                  <td data-label="Вид дохода">
                    {typeMap[item.incomeTypeId] ?? '—'}
                  </td>
                  <td data-label="Тип денег">
                    {fundTypeLabel(item.fundType)}
                    {item.fundType === 'card' && item.cardId
                      ? ` · ${cardMap[item.cardId] ?? ''}`
                      : ''}
                  </td>
                  <td data-label="Сумма" className="money up money-col">
                    {formatMoney(item.amount)}
                  </td>
                  <td className="actions-cell">
                    <RowActions
                      onEdit={() => openEdit(item)}
                      onCopy={() => openCopy(item)}
                      onDelete={() => removeIncome(item.id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title={editing ? 'Редактировать приход' : 'Новый приход'}
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={save}
      >
        <label className="field">
          <span>Дата</span>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </label>
        <label className="field">
          <span>Член семьи</span>
          <select
            value={form.memberId}
            onChange={(e) => setForm({ ...form, memberId: e.target.value })}
            required
          >
            {data.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Вид дохода</span>
          <select
            value={form.incomeTypeId}
            onChange={(e) => setForm({ ...form, incomeTypeId: e.target.value })}
            required
          >
            {data.incomeTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <FundTypeFields
          fundType={form.fundType}
          cardId={form.cardId}
          cards={data.cards}
          onFundTypeChange={(fundType) =>
            setForm({
              ...form,
              fundType,
              cardId: fundType === 'card' ? form.cardId : '',
            })
          }
          onCardChange={(cardId) => setForm({ ...form, cardId })}
        />
        <label className="field">
          <span>Сумма, ₽</span>
          <MoneyInput
            value={form.amount}
            onChange={(amount) => setForm({ ...form, amount })}
            required
          />
        </label>
        <label className="field">
          <span>Комментарий</span>
          <input
            type="text"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            placeholder="Необязательно"
          />
        </label>
      </Modal>
    </div>
  )
}
