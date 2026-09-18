import { useMemo, useState } from 'react'
import { FundTypeFields } from '../components/FundTypeFields'
import { Modal } from '../components/Modal'
import { MoneyInput } from '../components/MoneyInput'
import { SelectSheet } from '../components/SelectSheet'
import { RowActions } from '../components/RowActions'
import {
  compareValues,
  SortableTh,
  toggleSort,
  type SortState,
} from '../components/SortableTh'
import { useFinance } from '../FinanceContext'
import type { Expense, FundType } from '../types'
import {
  formatDate,
  formatMoney,
  fundTypeLabel,
  parseMoney,
  todayIso,
  toMoneyInput,
} from '../utils'

type SortKey = 'date' | 'member' | 'type' | 'fund' | 'amount'

const emptyForm = () => ({
  date: todayIso(),
  memberId: '',
  expenseTypeId: '',
  fundType: 'cash' as FundType,
  cardId: '',
  amount: '',
  comment: '',
})

export function ExpensesPage() {
  const { data, addExpense, updateExpense, removeExpense } = useFinance()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [typeFilter, setTypeFilter] = useState('')
  const [memberFilter, setMemberFilter] = useState('')
  const [sort, setSort] = useState<SortState<SortKey>>({ key: 'date', dir: 'desc' })

  const memberMap = useMemo(
    () => Object.fromEntries(data.members.map((m) => [m.id, m.name])),
    [data.members],
  )
  const typeMap = useMemo(
    () => Object.fromEntries(data.expenseTypes.map((t) => [t.id, t.name])),
    [data.expenseTypes],
  )
  const cardMap = useMemo(
    () =>
      Object.fromEntries(
        data.cards.map((c) => [c.id, `${c.name} •••• ${c.last4}`]),
      ),
    [data.cards],
  )

  const rows = useMemo(() => {
    const filtered = data.expenses
      .filter((item) => !typeFilter || item.expenseTypeId === typeFilter)
      .filter((item) => !memberFilter || item.memberId === memberFilter)

    return [...filtered].sort((a, b) => {
      const fundA =
        a.fundType === 'card' && a.cardId
          ? `${fundTypeLabel(a.fundType)} ${cardMap[a.cardId] ?? ''}`
          : fundTypeLabel(a.fundType)
      const fundB =
        b.fundType === 'card' && b.cardId
          ? `${fundTypeLabel(b.fundType)} ${cardMap[b.cardId] ?? ''}`
          : fundTypeLabel(b.fundType)

      const left =
        sort.key === 'date'
          ? a.date
          : sort.key === 'member'
            ? memberMap[a.memberId] ?? ''
            : sort.key === 'type'
              ? typeMap[a.expenseTypeId] ?? ''
              : sort.key === 'fund'
                ? fundA
                : a.amount
      const right =
        sort.key === 'date'
          ? b.date
          : sort.key === 'member'
            ? memberMap[b.memberId] ?? ''
            : sort.key === 'type'
              ? typeMap[b.expenseTypeId] ?? ''
              : sort.key === 'fund'
                ? fundB
                : b.amount

      return (
        compareValues(left, right, sort.dir) ||
        b.date.localeCompare(a.date) ||
        b.id.localeCompare(a.id)
      )
    })
  }, [
    data.expenses,
    typeFilter,
    memberFilter,
    sort,
    memberMap,
    typeMap,
    cardMap,
  ])

  const total = useMemo(() => rows.reduce((sum, item) => sum + item.amount, 0), [rows])

  const openCreate = () => {
    setEditing(null)
    setForm({
      ...emptyForm(),
      memberId: data.members[0]?.id ?? '',
      expenseTypeId: typeFilter || data.expenseTypes[0]?.id || '',
    })
    setOpen(true)
  }

  const openEdit = (item: Expense) => {
    setEditing(item)
    setForm({
      date: item.date,
      memberId: item.memberId,
      expenseTypeId: item.expenseTypeId,
      fundType: item.fundType,
      cardId: item.cardId ?? '',
      amount: toMoneyInput(item.amount),
      comment: item.comment ?? '',
    })
    setOpen(true)
  }

  const openCopy = (item: Expense) => {
    setEditing(null)
    setForm({
      date: todayIso(),
      memberId: item.memberId,
      expenseTypeId: item.expenseTypeId,
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
      expenseTypeId: form.expenseTypeId,
      fundType: form.fundType,
      cardId: form.fundType === 'card' ? form.cardId : undefined,
      amount,
      comment: form.comment.trim() || undefined,
    }

    if (editing) updateExpense({ ...payload, id: editing.id })
    else addExpense(payload)
    setOpen(false)
  }

  return (
    <div className="page fade-in">
      <PageHeader
        title="Расходы"
        subtitle="Журнал документов трат"
        action={
          <button type="button" className="btn primary" onClick={openCreate}>
            Новый расход
          </button>
        }
      />

      <div className="journal-filters">
        <SelectSheet
          label="Вид расхода"
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: '', label: 'Все' },
            ...data.expenseTypes.map((t) => ({ value: t.id, label: t.name })),
          ]}
        />
        <SelectSheet
          label="Член семьи"
          value={memberFilter}
          onChange={setMemberFilter}
          options={[
            { value: '', label: 'Все' },
            ...data.members.map((m) => ({ value: m.id, label: m.name })),
          ]}
        />
        <div className="journal-total">
          <span>Итого</span>
          <strong className="money down">{formatMoney(total)}</strong>
        </div>
      </div>

      <div className="table-wrap journal-table">
        <table className="responsive-table">
          <thead>
            <tr>
              <SortableTh
                label="Дата"
                column="date"
                sort={sort}
                onSort={(key) => setSort((prev) => toggleSort(prev, key))}
              />
              <SortableTh
                label="Член семьи"
                column="member"
                sort={sort}
                onSort={(key) => setSort((prev) => toggleSort(prev, key))}
              />
              <SortableTh
                label="Вид расхода"
                column="type"
                sort={sort}
                onSort={(key) => setSort((prev) => toggleSort(prev, key))}
              />
              <SortableTh
                label="Тип денег"
                column="fund"
                sort={sort}
                onSort={(key) => setSort((prev) => toggleSort(prev, key))}
              />
              <SortableTh
                label="Сумма"
                column="amount"
                sort={sort}
                onSort={(key) => setSort((prev) => toggleSort(prev, key))}
                className="money-col"
              />
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty">
                  {data.expenses.length === 0
                    ? 'Пока нет расходов. Создайте первый документ.'
                    : 'Нет документов по выбранным фильтрам.'}
                </td>
              </tr>
            ) : (
              rows.map((item) => (
                <tr key={item.id}>
                  <td data-label="Дата">{formatDate(item.date)}</td>
                  <td data-label="Член семьи">
                    {memberMap[item.memberId] ?? '—'}
                  </td>
                  <td data-label="Вид расхода">
                    {typeMap[item.expenseTypeId] ?? '—'}
                  </td>
                  <td data-label="Тип денег" className="fund-cell">
                    {fundTypeLabel(item.fundType)}
                    {item.fundType === 'card' && item.cardId
                      ? ` · ${cardMap[item.cardId] ?? ''}`
                      : ''}
                  </td>
                  <td data-label="Сумма" className="money down money-col">
                    {formatMoney(item.amount)}
                  </td>
                  <td className="actions-cell">
                    <RowActions
                      onEdit={() => openEdit(item)}
                      onCopy={() => openCopy(item)}
                      onDelete={() => removeExpense(item.id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title={editing ? 'Редактировать расход' : 'Новый расход'}
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
          <span>Вид расхода</span>
          <select
            value={form.expenseTypeId}
            onChange={(e) => setForm({ ...form, expenseTypeId: e.target.value })}
            required
          >
            {data.expenseTypes.map((t) => (
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
