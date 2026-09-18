import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditIcon, DirectoryIcon, ExpenseIcon, IncomeIcon, ReportIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/Icons'
import { useFinance } from '../FinanceContext'
import {
  dayOfMonth,
  daysInMonth,
  firstNameFromFio,
  formatMoney,
  isSameMonth,
  monthEndIso,
  monthLabel,
  monthStartIso,
  shiftMonth,
  sumBy,
  todayIso,
} from '../utils'

export function HomePage() {
  const { data, currentUser } = useFinance()
  const now = new Date()
  const [monthCursor, setMonthCursor] = useState(
    () => new Date(now.getFullYear(), now.getMonth(), 1),
  )

  const currentMonth = isSameMonth(monthCursor, now)
  const from = monthStartIso(monthCursor)
  const to = currentMonth ? todayIso() : monthEndIso(monthCursor)
  const daysTotal = daysInMonth(monthCursor)
  const day = currentMonth
    ? dayOfMonth(now)
    : monthCursor.getTime() < new Date(now.getFullYear(), now.getMonth(), 1).getTime()
      ? daysTotal
      : 0
  const progress = Math.min(100, Math.round((day / daysTotal) * 100))

  const monthIncomes = useMemo(
    () => data.incomes.filter((x) => x.date >= from && x.date <= to),
    [data.incomes, from, to],
  )
  const monthExpenses = useMemo(
    () => data.expenses.filter((x) => x.date >= from && x.date <= to),
    [data.expenses, from, to],
  )
  const incomeSum = sumBy(monthIncomes, (x) => x.amount)
  const expenseSum = sumBy(monthExpenses, (x) => x.amount)
  const balance = incomeSum - expenseSum
  const creditDebt = sumBy(data.credits, (x) => x.remainingAmount)
  const depositsSum = sumBy(data.deposits, (x) => x.amount)

  const hour = now.getHours()
  const hello =
    hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'
  const greetName = currentUser?.name ? firstNameFromFio(currentUser.name) : ''
  const label = monthLabel(monthCursor)

  return (
    <div className="page home-page fade-in">
      <section className="balance-hero">
        <p className="balance-label">Баланс месяца</p>
        <p className={`balance-value ${balance >= 0 ? 'up' : 'down'}`}>
          {formatMoney(balance)}
        </p>
        <div className="month-switcher" role="group" aria-label="Выбор месяца">
          <button
            type="button"
            className="month-nav"
            onClick={() => setMonthCursor((prev) => shiftMonth(prev, -1))}
            aria-label="Предыдущий месяц"
          >
            <ChevronLeftIcon />
          </button>
          <div className="month-switcher-center">
            <span className="month-switcher-caption">Семейный учёт</span>
            <strong className="month-switcher-value">{label}</strong>
            {!currentMonth ? (
              <button
                type="button"
                className="month-today"
                onClick={() =>
                  setMonthCursor(new Date(now.getFullYear(), now.getMonth(), 1))
                }
              >
                К текущему
              </button>
            ) : null}
          </div>
          <button
            type="button"
            className="month-nav"
            onClick={() => setMonthCursor((prev) => shiftMonth(prev, 1))}
            aria-label="Следующий месяц"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </section>

      <div className="summary-row">
        <article className="summary-chip">
          <span className="summary-icon up">
            <IncomeIcon size={18} />
          </span>
          <div>
            <span>Доходы</span>
            <strong className="up">{formatMoney(incomeSum)}</strong>
          </div>
        </article>
        <article className="summary-chip">
          <span className="summary-icon down">
            <ExpenseIcon size={18} />
          </span>
          <div>
            <span>Расходы</span>
            <strong className="down">{formatMoney(expenseSum)}</strong>
          </div>
        </article>
        <article className="summary-chip">
          <span className="summary-icon soft">
            <CreditIcon size={18} />
          </span>
          <div>
            <span>Вклады</span>
            <strong>{formatMoney(depositsSum)}</strong>
          </div>
        </article>
      </div>

      <section className="greet-card">
        <div>
          <strong>
            {hello}
            {greetName ? `, ${greetName}` : ''}!
          </strong>
          <p>Откройте раздел, создайте документ или посмотрите отчёт.</p>
        </div>
      </section>

      <section className="month-card">
        <div className="month-card-head">
          <h2>{label}</h2>
          <span>
            {day} / {daysTotal} дней
          </span>
        </div>

        <div className={`saved-box ${balance >= 0 ? 'positive' : 'negative'}`}>
          <span>{balance >= 0 ? 'Получено за месяц' : 'Минус за месяц'}</span>
          <strong>{formatMoney(Math.abs(balance))}</strong>
        </div>

        <div className="progress-track" aria-hidden>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="home-actions">
          <Link className="btn pill primary" to="/incomes">
            + Приход
          </Link>
          <Link className="btn pill soft" to="/expenses">
            − Расход
          </Link>
        </div>
      </section>

      <section className="menu-list">
        <Link className="menu-row" to="/reports">
          <span className="menu-ico tone-a">
            <ReportIcon size={18} />
          </span>
          <div>
            <strong>Отчёты</strong>
            <p>Доходы, расходы и баланс за период</p>
          </div>
          <span className="menu-chevron">›</span>
        </Link>
        <Link className="menu-row" to="/directories">
          <span className="menu-ico tone-b">
            <DirectoryIcon size={18} />
          </span>
          <div>
            <strong>Справочники</strong>
            <p>Семья, виды доходов и расходов, карты</p>
          </div>
          <span className="menu-chevron">›</span>
        </Link>
        <Link className="menu-row" to="/credits">
          <span className="menu-ico tone-c">
            <CreditIcon size={18} />
          </span>
          <div>
            <strong>Кредиты и вклады</strong>
            <p>Остаток: {formatMoney(creditDebt)}</p>
          </div>
          <span className="menu-chevron">›</span>
        </Link>
      </section>
    </div>
  )
}
