import { useMemo } from 'react'
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
  sumBy,
} from '../utils'

type Kind = 'income' | 'expense'

export function MonthBreakdownPage() {
  const { kind, month } = useParams()
  const { data } = useFinance()
  const cursor = month ? parseMonthKey(month) : null
  const mode: Kind = kind === 'expense' ? 'expense' : 'income'

  const bounds = cursor ? monthBounds(cursor) : null

  const rows = useMemo(() => {
    if (!bounds) return []
    if (mode === 'income') {
      return data.incomes
        .filter((item) => item.date >= bounds.from && item.date <= bounds.to)
        .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    }
    return data.expenses
      .filter((item) => item.date >= bounds.from && item.date <= bounds.to)
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
  }, [bounds, data.expenses, data.incomes, mode])

  const total = sumBy(rows, (item) => item.amount)

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
  const typeLabel = mode === 'income' ? 'Вид дохода' : 'Вид расхода'
  const label = monthLabel(cursor)

  return (
    <div className="page fade-in">
      <PageHeader
        title={title}
        subtitle={
          bounds.current
            ? `Из чего сложилась сумма · ${label} · до сегодня`
            : `Из чего сложилась сумма · ${label}`
        }
        action={
          <Link className="btn ghost" to="/">
            На главную
          </Link>
        }
      />

      <div className="journal-filters">
        <div className="journal-total">
          <span>Документов: {rows.length}</span>
          <strong className={mode === 'income' ? 'money up' : 'money down'}>
            {formatMoney(total)}
          </strong>
        </div>
      </div>

      <div className="table-wrap journal-table">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Член семьи</th>
              <th>{typeLabel}</th>
              <th>Тип денег</th>
              <th className="money-col">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty">
                  За этот месяц документов нет.
                </td>
              </tr>
            ) : mode === 'income' ? (
              (rows as typeof data.incomes).map((item) => (
                <tr key={item.id}>
                  <td data-label="Дата">{formatDate(item.date)}</td>
                  <td data-label="Член семьи">{memberMap[item.memberId] ?? '—'}</td>
                  <td data-label={typeLabel}>{incomeTypeMap[item.incomeTypeId] ?? '—'}</td>
                  <td data-label="Тип денег" className="fund-cell">
                    {fundTypeLabel(item.fundType)}
                    {item.fundType === 'card' && item.cardId
                      ? ` · ${cardMap[item.cardId] ?? ''}`
                      : ''}
                  </td>
                  <td data-label="Сумма" className="money money-col up">
                    {formatMoney(item.amount)}
                  </td>
                </tr>
              ))
            ) : (
              (rows as typeof data.expenses).map((item) => (
                <tr key={item.id}>
                  <td data-label="Дата">{formatDate(item.date)}</td>
                  <td data-label="Член семьи">{memberMap[item.memberId] ?? '—'}</td>
                  <td data-label={typeLabel}>{expenseTypeMap[item.expenseTypeId] ?? '—'}</td>
                  <td data-label="Тип денег" className="fund-cell">
                    {fundTypeLabel(item.fundType)}
                    {item.fundType === 'card' && item.cardId
                      ? ` · ${cardMap[item.cardId] ?? ''}`
                      : ''}
                  </td>
                  <td data-label="Сумма" className="money money-col down">
                    {formatMoney(item.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
