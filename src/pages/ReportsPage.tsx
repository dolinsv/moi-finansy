import { useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { useFinance } from '../FinanceContext'
import type { ReportKind } from '../types'
import {
  formatDate,
  formatMoney,
  monthStartIso,
  sumBy,
  todayIso,
} from '../utils'

export function ReportsPage() {
  const { data } = useFinance()
  const [kind, setKind] = useState<ReportKind>('balance')
  const [dateFrom, setDateFrom] = useState(monthStartIso())
  const [dateTo, setDateTo] = useState(todayIso())
  const [memberId, setMemberId] = useState('')
  const [incomeTypeId, setIncomeTypeId] = useState('')
  const [expenseTypeId, setExpenseTypeId] = useState('')

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

  const filteredIncomes = useMemo(
    () =>
      data.incomes.filter((item) => {
        if (dateFrom && item.date < dateFrom) return false
        if (dateTo && item.date > dateTo) return false
        if (memberId && item.memberId !== memberId) return false
        if (incomeTypeId && item.incomeTypeId !== incomeTypeId) return false
        return true
      }),
    [data.incomes, dateFrom, dateTo, memberId, incomeTypeId],
  )

  const filteredExpenses = useMemo(
    () =>
      data.expenses.filter((item) => {
        if (dateFrom && item.date < dateFrom) return false
        if (dateTo && item.date > dateTo) return false
        if (memberId && item.memberId !== memberId) return false
        if (expenseTypeId && item.expenseTypeId !== expenseTypeId) return false
        return true
      }),
    [data.expenses, dateFrom, dateTo, memberId, expenseTypeId],
  )

  const incomeTotal = sumBy(filteredIncomes, (x) => x.amount)
  const expenseTotal = sumBy(filteredExpenses, (x) => x.amount)

  const incomeByType = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of filteredIncomes) {
      map.set(item.incomeTypeId, (map.get(item.incomeTypeId) ?? 0) + item.amount)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [filteredIncomes])

  const expenseByType = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of filteredExpenses) {
      map.set(item.expenseTypeId, (map.get(item.expenseTypeId) ?? 0) + item.amount)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [filteredExpenses])

  const resultKey = [
    kind,
    dateFrom,
    dateTo,
    memberId,
    incomeTypeId,
    expenseTypeId,
    filteredIncomes.length,
    filteredExpenses.length,
    incomeTotal,
    expenseTotal,
  ].join('|')

  return (
    <div className="page fade-in">
      <PageHeader
        title="Отчёты"
        subtitle="Результат пересчитывается сразу при смене любого фильтра"
      />

      <section className="filters">
        <label className="field">
          <span>Тип отчёта</span>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as ReportKind)}
          >
            <option value="income">По доходам</option>
            <option value="expense">По расходам</option>
            <option value="balance">Общий (доходы − расходы)</option>
          </select>
        </label>
        <label className="field">
          <span>Период с</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </label>
        <label className="field">
          <span>по</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Член семьи</span>
          <select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            <option value="">Все</option>
            {data.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        {(kind === 'income' || kind === 'balance') && (
          <label className="field">
            <span>Вид дохода</span>
            <select
              value={incomeTypeId}
              onChange={(e) => setIncomeTypeId(e.target.value)}
            >
              <option value="">Все</option>
              {data.incomeTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {(kind === 'expense' || kind === 'balance') && (
          <label className="field">
            <span>Вид расхода</span>
            <select
              value={expenseTypeId}
              onChange={(e) => setExpenseTypeId(e.target.value)}
            >
              <option value="">Все</option>
              {data.expenseTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </section>

      <div className="report-live" key={resultKey}>
        <div className="stat-grid compact">
          {(kind === 'income' || kind === 'balance') && (
            <article className="stat tone-up">
              <span>Итого доходы</span>
              <strong>{formatMoney(incomeTotal)}</strong>
            </article>
          )}
          {(kind === 'expense' || kind === 'balance') && (
            <article className="stat tone-down">
              <span>Итого расходы</span>
              <strong>{formatMoney(expenseTotal)}</strong>
            </article>
          )}
          {kind === 'balance' && (
            <article className="stat tone-balance">
              <span>Баланс</span>
              <strong>{formatMoney(incomeTotal - expenseTotal)}</strong>
            </article>
          )}
        </div>

        {(kind === 'income' || kind === 'balance') && (
          <section className="report-block">
            <h3>Доходы по видам</h3>
            <div className="table-wrap nested">
              <table>
                <thead>
                  <tr>
                    <th>Вид дохода</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeByType.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="empty">
                        Нет данных за период
                      </td>
                    </tr>
                  ) : (
                    incomeByType.map(([typeId, amount]) => (
                      <tr key={typeId}>
                        <td>{incomeTypeMap[typeId] ?? '—'}</td>
                        <td className="money up">{formatMoney(amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <h3>Документы приходов</h3>
            <div className="table-wrap nested">
              <table>
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Член семьи</th>
                    <th>Вид</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncomes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="empty">
                        Нет документов
                      </td>
                    </tr>
                  ) : (
                    filteredIncomes.map((item) => (
                      <tr key={item.id}>
                        <td>{formatDate(item.date)}</td>
                        <td>{memberMap[item.memberId] ?? '—'}</td>
                        <td>{incomeTypeMap[item.incomeTypeId] ?? '—'}</td>
                        <td className="money up">{formatMoney(item.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {(kind === 'expense' || kind === 'balance') && (
          <section className="report-block">
            <h3>Расходы по видам</h3>
            <div className="table-wrap nested">
              <table>
                <thead>
                  <tr>
                    <th>Вид расхода</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseByType.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="empty">
                        Нет данных за период
                      </td>
                    </tr>
                  ) : (
                    expenseByType.map(([typeId, amount]) => (
                      <tr key={typeId}>
                        <td>{expenseTypeMap[typeId] ?? '—'}</td>
                        <td className="money down">{formatMoney(amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <h3>Документы расходов</h3>
            <div className="table-wrap nested">
              <table>
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Член семьи</th>
                    <th>Вид</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="empty">
                        Нет документов
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((item) => (
                      <tr key={item.id}>
                        <td>{formatDate(item.date)}</td>
                        <td>{memberMap[item.memberId] ?? '—'}</td>
                        <td>{expenseTypeMap[item.expenseTypeId] ?? '—'}</td>
                        <td className="money down">{formatMoney(item.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
