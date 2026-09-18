import { useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import {
  ProgressChart,
  ShareChart,
} from '../components/ShareChart'
import { useFinance } from '../FinanceContext'
import type { ReportKind } from '../types'
import {
  firstNameFromFio,
  formatDate,
  formatMoney,
  monthStartIso,
  sumBy,
  todayIso,
} from '../utils'

const tabs: { id: ReportKind; label: string; short: string }[] = [
  { id: 'income', label: 'Доходы', short: 'Доходы' },
  { id: 'expense', label: 'Расходы', short: 'Расходы' },
  { id: 'credits', label: 'Кредиты', short: 'Кредиты' },
  { id: 'deposits', label: 'Вклады', short: 'Вклады' },
]

export function ReportsPage() {
  const { data } = useFinance()
  const [kind, setKind] = useState<ReportKind>('income')
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
    return [...map.entries()]
      .map(([id, value]) => ({
        id,
        label: incomeTypeMap[id] ?? 'Без вида',
        value,
      }))
      .sort((a, b) => b.value - a.value)
  }, [filteredIncomes, incomeTypeMap])

  const expenseByType = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of filteredExpenses) {
      map.set(item.expenseTypeId, (map.get(item.expenseTypeId) ?? 0) + item.amount)
    }
    return [...map.entries()]
      .map(([id, value]) => ({
        id,
        label: expenseTypeMap[id] ?? 'Без вида',
        value,
      }))
      .sort((a, b) => b.value - a.value)
  }, [filteredExpenses, expenseTypeMap])

  const incomeByMember = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of filteredIncomes) {
      map.set(item.memberId, (map.get(item.memberId) ?? 0) + item.amount)
    }
    return [...map.entries()]
      .map(([id, value]) => ({
        id,
        label: firstNameFromFio(memberMap[id] ?? '—') || '—',
        value,
      }))
      .sort((a, b) => b.value - a.value)
  }, [filteredIncomes, memberMap])

  const expenseByMember = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of filteredExpenses) {
      map.set(item.memberId, (map.get(item.memberId) ?? 0) + item.amount)
    }
    return [...map.entries()]
      .map(([id, value]) => ({
        id,
        label: firstNameFromFio(memberMap[id] ?? '—') || '—',
        value,
      }))
      .sort((a, b) => b.value - a.value)
  }, [filteredExpenses, memberMap])

  const creditDebt = sumBy(data.credits, (x) => x.remainingAmount)
  const creditTotal = sumBy(data.credits, (x) => x.totalAmount)
  const creditMonthly = sumBy(data.credits, (x) => x.monthlyPayment)
  const depositsSum = sumBy(data.deposits, (x) => x.amount)

  const depositsByBank = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of data.deposits) {
      const key = item.bank.trim() || 'Без банка'
      map.set(key, (map.get(key) ?? 0) + item.amount)
    }
    return [...map.entries()]
      .map(([label, value]) => ({ id: label, label, value }))
      .sort((a, b) => b.value - a.value)
  }, [data.deposits])

  const creditsByKind = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of data.credits) {
      const label = item.kind === 'installment' ? 'Рассрочка' : 'Кредит'
      map.set(label, (map.get(label) ?? 0) + item.remainingAmount)
    }
    return [...map.entries()]
      .map(([label, value]) => ({ id: label, label, value }))
      .sort((a, b) => b.value - a.value)
  }, [data.credits])

  const periodFilters = kind === 'income' || kind === 'expense'

  const resultKey = [
    kind,
    dateFrom,
    dateTo,
    memberId,
    incomeTypeId,
    expenseTypeId,
    filteredIncomes.length,
    filteredExpenses.length,
    data.credits.length,
    data.deposits.length,
  ].join('|')

  return (
    <div className="page fade-in">
      <PageHeader
        title="Отчёты"
        subtitle="Выберите раздел — цифры и диаграммы обновляются сразу"
      />

      <div className="segmented segmented-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={kind === tab.id ? 'seg active' : 'seg'}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setKind(tab.id)}
          >
            <span className="seg-full">{tab.label}</span>
            <span className="seg-short">{tab.short}</span>
          </button>
        ))}
      </div>

      {periodFilters ? (
        <section className="filters">
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
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            >
              <option value="">Все</option>
              {data.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          {kind === 'income' ? (
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
          ) : (
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
      ) : null}

      <div className="report-live" key={resultKey}>
        {kind === 'income' ? (
          <>
            <div className="stat-grid compact">
              <article className="stat tone-up">
                <span>Итого доходы</span>
                <strong>{formatMoney(incomeTotal)}</strong>
              </article>
              <article className="stat">
                <span>Документов</span>
                <strong>{filteredIncomes.length}</strong>
              </article>
            </div>

            <section className="report-block">
              <h3>По видам</h3>
              <ShareChart items={incomeByType} tone="up" />
            </section>

            <section className="report-block">
              <h3>По членам семьи</h3>
              <ShareChart items={incomeByMember} tone="up" />
            </section>

            <section className="report-block">
              <h3>Документы</h3>
              <div className="table-wrap nested">
                <table className="responsive-table">
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
                          <td data-label="Дата">{formatDate(item.date)}</td>
                          <td data-label="Член семьи">
                            {memberMap[item.memberId] ?? '—'}
                          </td>
                          <td data-label="Вид">
                            {incomeTypeMap[item.incomeTypeId] ?? '—'}
                          </td>
                          <td data-label="Сумма" className="money up">
                            {formatMoney(item.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}

        {kind === 'expense' ? (
          <>
            <div className="stat-grid compact">
              <article className="stat tone-down">
                <span>Итого расходы</span>
                <strong>{formatMoney(expenseTotal)}</strong>
              </article>
              <article className="stat">
                <span>Документов</span>
                <strong>{filteredExpenses.length}</strong>
              </article>
            </div>

            <section className="report-block">
              <h3>По видам</h3>
              <ShareChart items={expenseByType} tone="down" />
            </section>

            <section className="report-block">
              <h3>По членам семьи</h3>
              <ShareChart items={expenseByMember} tone="down" />
            </section>

            <section className="report-block">
              <h3>Документы</h3>
              <div className="table-wrap nested">
                <table className="responsive-table">
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
                          <td data-label="Дата">{formatDate(item.date)}</td>
                          <td data-label="Член семьи">
                            {memberMap[item.memberId] ?? '—'}
                          </td>
                          <td data-label="Вид">
                            {expenseTypeMap[item.expenseTypeId] ?? '—'}
                          </td>
                          <td data-label="Сумма" className="money down">
                            {formatMoney(item.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}

        {kind === 'credits' ? (
          <>
            <div className="stat-grid compact">
              <article className="stat tone-down">
                <span>Остаток долга</span>
                <strong>{formatMoney(creditDebt)}</strong>
              </article>
              <article className="stat">
                <span>Платежи / мес.</span>
                <strong>{formatMoney(creditMonthly)}</strong>
              </article>
              <article className="stat">
                <span>Было взято</span>
                <strong>{formatMoney(creditTotal)}</strong>
              </article>
            </div>

            <section className="report-block">
              <h3>По типам</h3>
              <ShareChart
                items={creditsByKind}
                tone="down"
                emptyText="Кредитов пока нет"
              />
            </section>

            <section className="report-block">
              <h3>Погашение</h3>
              {data.credits.length === 0 ? (
                <p className="chart-empty">Кредитов пока нет</p>
              ) : (
                <div className="credit-progress-list">
                  {data.credits.map((item) => (
                    <ProgressChart
                      key={item.id}
                      label={item.title}
                      current={item.totalAmount - item.remainingAmount}
                      total={item.totalAmount}
                      tone="soft"
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="report-block">
              <h3>Список</h3>
              <div className="table-wrap nested">
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Название</th>
                      <th>Тип</th>
                      <th>Остаток</th>
                      <th>Платёж</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.credits.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="empty">
                          Нет кредитов
                        </td>
                      </tr>
                    ) : (
                      data.credits.map((item) => (
                        <tr key={item.id}>
                          <td data-label="Название">
                            <strong>{item.title}</strong>
                            <div className="muted">{item.creditor}</div>
                          </td>
                          <td data-label="Тип">
                            {item.kind === 'installment'
                              ? 'Рассрочка'
                              : 'Кредит'}
                          </td>
                          <td data-label="Остаток" className="money down">
                            {formatMoney(item.remainingAmount)}
                          </td>
                          <td data-label="Платёж">
                            {formatMoney(item.monthlyPayment)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}

        {kind === 'deposits' ? (
          <>
            <div className="stat-grid compact">
              <article className="stat tone-up">
                <span>Всего на вкладах</span>
                <strong>{formatMoney(depositsSum)}</strong>
              </article>
              <article className="stat">
                <span>Вкладов</span>
                <strong>{data.deposits.length}</strong>
              </article>
            </div>

            <section className="report-block">
              <h3>По банкам</h3>
              <ShareChart
                items={depositsByBank}
                tone="up"
                emptyText="Вкладов пока нет"
              />
            </section>

            <section className="report-block">
              <h3>Список</h3>
              <div className="table-wrap nested">
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Вклад</th>
                      <th>Банк</th>
                      <th>Сумма</th>
                      <th>Ставка</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.deposits.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="empty">
                          Нет вкладов
                        </td>
                      </tr>
                    ) : (
                      data.deposits.map((item) => (
                        <tr key={item.id}>
                          <td data-label="Вклад">
                            <strong>{item.title}</strong>
                          </td>
                          <td data-label="Банк">{item.bank || '—'}</td>
                          <td data-label="Сумма" className="money up">
                            {formatMoney(item.amount)}
                          </td>
                          <td data-label="Ставка">{item.rate}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  )
}
