import { Link } from 'react-router-dom'
import { CreditIcon, DirectoryIcon, ExpenseIcon, IncomeIcon, ReportIcon } from '../components/Icons'
import { useFinance } from '../FinanceContext'
import {
  dayOfMonth,
  daysInMonth,
  firstNameFromFio,
  formatMoney,
  monthLabel,
  monthStartIso,
  sumBy,
  todayIso,
} from '../utils'

export function HomePage() {
  const { data, currentUser, vkUser } = useFinance()
  const from = monthStartIso()
  const to = todayIso()
  const now = new Date()
  const day = dayOfMonth(now)
  const daysTotal = daysInMonth(now)
  const progress = Math.min(100, Math.round((day / daysTotal) * 100))

  const monthIncomes = data.incomes.filter(
    (x) => x.date >= from && x.date <= to,
  )
  const monthExpenses = data.expenses.filter(
    (x) => x.date >= from && x.date <= to,
  )
  const incomeSum = sumBy(monthIncomes, (x) => x.amount)
  const expenseSum = sumBy(monthExpenses, (x) => x.amount)
  const balance = incomeSum - expenseSum
  const creditDebt = sumBy(data.credits, (x) => x.remainingAmount)
  const depositsSum = sumBy(data.deposits, (x) => x.amount)

  const hour = now.getHours()
  const hello =
    hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'
  const greetName =
    currentUser?.vkId && vkUser?.first_name
      ? vkUser.first_name
      : currentUser?.name
        ? firstNameFromFio(currentUser.name)
        : ''

  return (
    <div className="page home-page fade-in">
      <section className="balance-hero">
        <p className="balance-label">Баланс месяца</p>
        <p className={`balance-value ${balance >= 0 ? 'up' : 'down'}`}>
          {formatMoney(balance)}
        </p>
        <p className="balance-sub">Семейный учёт · {monthLabel(now)}</p>
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
          <h2>{monthLabel(now)}</h2>
          <span>
            {day} / {daysTotal} дней
          </span>
        </div>

        <div className={`saved-box ${balance >= 0 ? 'positive' : 'negative'}`}>
          <span>{balance >= 0 ? 'Отложено за месяц' : 'Минус за месяц'}</span>
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
