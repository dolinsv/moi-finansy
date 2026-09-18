import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useFinance } from '../FinanceContext'
import {
  formatDate,
  formatMoney,
  fundTypeLabel,
  monthBounds,
  monthLabel,
  parseMonthKey,
} from '../utils'

type Kind = 'income' | 'expense'

type Line = {
  id: string
  date: string
  typeId: string
  typeName: string
  amount: number
  member: string
  fund: string
  comment?: string
}

export function MonthBreakdownPage() {
  const { kind, month } = useParams()
  const { data } = useFinance()
  const cursor = month ? parseMonthKey(month) : null
  const mode: Kind = kind === 'expense' ? 'expense' : 'income'
  const bounds = cursor ? monthBounds(cursor) : null
  const [typeFilter, setTypeFilter] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const memberMap = useMemo(
    () => Object.fromEntries(data.members.map((m) => [m.id, m.name])),
    [data.members],
  )
  const incomeTypeMap = useMemo(
    () => Object.fromEntries(data.incomeTypes.map((t) => [t.id, t.name])),
    [data.incomeTypes],
  )
  const expenseTypeMap = useMemo(
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

  const lines = useMemo<Line[]>(() => {
    if (!bounds) return []
    const source =
      mode === 'income'
        ? data.incomes.filter((item) => item.date >= bounds.from && item.date <= bounds.to)
        : data.expenses.filter((item) => item.date >= bounds.from && item.date <= bounds.to)

    return source
      .map((item) => {
        const typeId =
          'incomeTypeId' in item ? item.incomeTypeId : item.expenseTypeId
        const typeName =
          mode === 'income'
            ? incomeTypeMap[typeId] ?? '—'
            : expenseTypeMap[typeId] ?? '—'
        const fund =
          item.fundType === 'card' && item.cardId
            ? `${fundTypeLabel(item.fundType)} · ${cardMap[item.cardId] ?? ''}`
            : fundTypeLabel(item.fundType)
        return {
          id: item.id,
          date: item.date,
          typeId,
          typeName,
          amount: item.amount,
          member: memberMap[item.memberId] ?? '—',
          fund,
          comment: item.comment,
        }
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
  }, [
    bounds,
    cardMap,
    data.expenses,
    data.incomes,
    expenseTypeMap,
    incomeTypeMap,
    memberMap,
    mode,
  ])

  const types = useMemo(() => {
    const map = new Map<string, { id: string; name: string; sum: number }>()
    for (const line of lines) {
      const prev = map.get(line.typeId)
      if (prev) prev.sum += line.amount
      else map.set(line.typeId, { id: line.typeId, name: line.typeName, sum: line.amount })
    }
    return [...map.values()].sort((a, b) => b.sum - a.sum)
  }, [lines])

  const visible = typeFilter ? lines.filter((line) => line.typeId === typeFilter) : lines
  const total = visible.reduce((sum, line) => sum + line.amount, 0)
  const max = visible.reduce((m, line) => Math.max(m, line.amount), 0)

  if (!cursor || !bounds) {
    return (
      <div className="page fade-in">
        <PageHeader title="Расшифровка" subtitle="Месяц не найден" />
        <Link className="btn ghost" to="/">
          На главную
        </Link>
      </div>
    )
  }

  const title = mode === 'income' ? 'Доходы' : 'Расходы'
  const label = monthLabel(cursor)

  return (
    <div className={`page breakdown-page fade-in ${mode}`}>
      <PageHeader
        title={title}
        subtitle={bounds.current ? `${label} · до сегодня` : label}
        action={
          <Link className="btn ghost" to="/">
            На главную
          </Link>
        }
      />

      <section className="breakdown-total">
        <span>Сумма</span>
        <strong>{formatMoney(total)}</strong>
      </section>

      {types.length > 1 ? (
        <div className="breakdown-chips" role="tablist" aria-label="Вид">
          <button
            type="button"
            className={typeFilter === '' ? 'breakdown-chip active' : 'breakdown-chip'}
            onClick={() => {
              setTypeFilter('')
              setOpenId(null)
            }}
          >
            Все
          </button>
          {types.map((type) => (
            <button
              key={type.id}
              type="button"
              className={
                typeFilter === type.id ? 'breakdown-chip active' : 'breakdown-chip'
              }
              onClick={() => {
                setTypeFilter(type.id)
                setOpenId(null)
              }}
            >
              {type.name}
            </button>
          ))}
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className="empty-block">За этот месяц записей нет.</p>
      ) : (
        <ul className="breakdown-list">
          {visible.map((line) => {
            const open = openId === line.id
            const share = max > 0 ? Math.max(8, Math.round((line.amount / max) * 100)) : 0
            return (
              <li key={line.id}>
                <button
                  type="button"
                  className={open ? 'breakdown-row open' : 'breakdown-row'}
                  onClick={() => setOpenId(open ? null : line.id)}
                  aria-expanded={open}
                >
                  <div className="breakdown-main">
                    <strong>{line.typeName}</strong>
                    <span>{formatDate(line.date)}</span>
                  </div>
                  <em>{formatMoney(line.amount)}</em>
                  <i className="breakdown-bar" style={{ width: `${share}%` }} />
                </button>
                {open ? (
                  <div className="breakdown-detail">
                    <span>{line.member}</span>
                    <span>{line.fund}</span>
                    {line.comment ? <span>{line.comment}</span> : null}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
