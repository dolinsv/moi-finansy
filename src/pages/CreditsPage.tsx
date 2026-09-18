import { useState } from 'react'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { RowActions } from '../components/RowActions'
import { useFinance } from '../FinanceContext'
import type { Credit, CreditKind, Deposit } from '../types'
import { formatDate, formatMoney, parseMoney, todayIso } from '../utils'

type Section = 'credits' | 'deposits'

const emptyCredit = () => ({
  title: '',
  kind: 'loan' as CreditKind,
  creditor: '',
  totalAmount: '',
  remainingAmount: '',
  monthlyPayment: '',
  startDate: todayIso(),
  endDate: '',
  comment: '',
})

const emptyDeposit = () => ({
  title: '',
  bank: '',
  amount: '',
  rate: '',
  startDate: todayIso(),
  endDate: '',
  comment: '',
})

export function CreditsPage() {
  const {
    data,
    addCredit,
    updateCredit,
    removeCredit,
    addDeposit,
    updateDeposit,
    removeDeposit,
  } = useFinance()

  const [section, setSection] = useState<Section>('credits')
  const [open, setOpen] = useState(false)
  const [editingCredit, setEditingCredit] = useState<Credit | null>(null)
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null)
  const [creditForm, setCreditForm] = useState(emptyCredit)
  const [depositForm, setDepositForm] = useState(emptyDeposit)

  const openCreate = () => {
    if (section === 'credits') {
      setEditingCredit(null)
      setCreditForm(emptyCredit())
    } else {
      setEditingDeposit(null)
      setDepositForm(emptyDeposit())
    }
    setOpen(true)
  }

  const openEditCredit = (item: Credit) => {
    setSection('credits')
    setEditingCredit(item)
    setCreditForm({
      title: item.title,
      kind: item.kind,
      creditor: item.creditor,
      totalAmount: String(item.totalAmount),
      remainingAmount: String(item.remainingAmount),
      monthlyPayment: String(item.monthlyPayment),
      startDate: item.startDate,
      endDate: item.endDate ?? '',
      comment: item.comment ?? '',
    })
    setOpen(true)
  }

  const openEditDeposit = (item: Deposit) => {
    setSection('deposits')
    setEditingDeposit(item)
    setDepositForm({
      title: item.title,
      bank: item.bank,
      amount: String(item.amount),
      rate: String(item.rate),
      startDate: item.startDate,
      endDate: item.endDate ?? '',
      comment: item.comment ?? '',
    })
    setOpen(true)
  }

  const save = () => {
    if (section === 'credits') {
      const payload = {
        title: creditForm.title.trim(),
        kind: creditForm.kind,
        creditor: creditForm.creditor.trim(),
        totalAmount: parseMoney(creditForm.totalAmount),
        remainingAmount: parseMoney(creditForm.remainingAmount),
        monthlyPayment: parseMoney(creditForm.monthlyPayment),
        startDate: creditForm.startDate,
        endDate: creditForm.endDate || undefined,
        comment: creditForm.comment.trim() || undefined,
      }
      if (!payload.title || !payload.creditor || payload.totalAmount <= 0) return
      if (editingCredit) updateCredit({ ...payload, id: editingCredit.id })
      else addCredit(payload)
    } else {
      const payload = {
        title: depositForm.title.trim(),
        bank: depositForm.bank.trim(),
        amount: parseMoney(depositForm.amount),
        rate: Number(depositForm.rate),
        startDate: depositForm.startDate,
        endDate: depositForm.endDate || undefined,
        comment: depositForm.comment.trim() || undefined,
      }
      if (!payload.title || !payload.bank || payload.amount <= 0) return
      if (editingDeposit) updateDeposit({ ...payload, id: editingDeposit.id })
      else addDeposit(payload)
    }
    setOpen(false)
  }

  return (
    <div className="page fade-in">
      <PageHeader
        title="Кредиты и вклады"
        subtitle="Займы, рассрочки и депозиты семьи"
        action={
          <button type="button" className="btn primary" onClick={openCreate}>
            {section === 'credits' ? 'Новый кредит' : 'Новый вклад'}
          </button>
        }
      />

      <div className="segmented segmented-2">
        <button
          type="button"
          className={section === 'credits' ? 'seg active' : 'seg'}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setSection('credits')}
        >
          Кредиты
        </button>
        <button
          type="button"
          className={section === 'deposits' ? 'seg active' : 'seg'}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setSection('deposits')}
        >
          Вклады
        </button>
      </div>

      {section === 'credits' ? (
        <div className="table-wrap">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Тип</th>
                <th>Кредитор</th>
                <th>Остаток</th>
                <th>Платёж / мес.</th>
                <th>Срок</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.credits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    Кредитов пока нет.
                  </td>
                </tr>
              ) : (
                data.credits.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Название">{item.title}</td>
                    <td data-label="Тип">
                      {item.kind === 'loan' ? 'Займ' : 'Рассрочка'}
                    </td>
                    <td data-label="Кредитор">{item.creditor}</td>
                    <td data-label="Остаток" className="money down">
                      {formatMoney(item.remainingAmount)}
                    </td>
                    <td data-label="Платёж / мес.">
                      {formatMoney(item.monthlyPayment)}
                    </td>
                    <td data-label="Срок">
                      {formatDate(item.startDate)}
                      {item.endDate ? ` — ${formatDate(item.endDate)}` : ''}
                    </td>
                    <td className="actions-cell">
                      <RowActions
                        onEdit={() => openEditCredit(item)}
                        onDelete={() => removeCredit(item.id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Банк</th>
                <th>Сумма</th>
                <th>Ставка</th>
                <th>Срок</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.deposits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty">
                    Вкладов пока нет.
                  </td>
                </tr>
              ) : (
                data.deposits.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Название">{item.title}</td>
                    <td data-label="Банк">{item.bank}</td>
                    <td data-label="Сумма" className="money up">
                      {formatMoney(item.amount)}
                    </td>
                    <td data-label="Ставка">{item.rate}%</td>
                    <td data-label="Срок">
                      {formatDate(item.startDate)}
                      {item.endDate ? ` — ${formatDate(item.endDate)}` : ''}
                    </td>
                    <td className="actions-cell">
                      <RowActions
                        onEdit={() => openEditDeposit(item)}
                        onDelete={() => removeDeposit(item.id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        title={
          section === 'credits'
            ? editingCredit
              ? 'Редактировать кредит'
              : 'Новый кредит'
            : editingDeposit
              ? 'Редактировать вклад'
              : 'Новый вклад'
        }
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={save}
      >
        {section === 'credits' ? (
          <>
            <label className="field">
              <span>Название</span>
              <input
                type="text"
                value={creditForm.title}
                onChange={(e) => setCreditForm({ ...creditForm, title: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Тип</span>
              <select
                value={creditForm.kind}
                onChange={(e) =>
                  setCreditForm({ ...creditForm, kind: e.target.value as CreditKind })
                }
              >
                <option value="loan">Займ</option>
                <option value="installment">Рассрочка</option>
              </select>
            </label>
            <label className="field">
              <span>Кредитор</span>
              <input
                type="text"
                value={creditForm.creditor}
                onChange={(e) => setCreditForm({ ...creditForm, creditor: e.target.value })}
                required
              />
            </label>
            <div className="field-row">
              <label className="field">
                <span>Общая сумма, ₽</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={creditForm.totalAmount}
                  onChange={(e) =>
                    setCreditForm({ ...creditForm, totalAmount: e.target.value })
                  }
                  required
                />
              </label>
              <label className="field">
                <span>Остаток, ₽</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={creditForm.remainingAmount}
                  onChange={(e) =>
                    setCreditForm({ ...creditForm, remainingAmount: e.target.value })
                  }
                  required
                />
              </label>
            </div>
            <label className="field">
              <span>Ежемесячный платёж, ₽</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={creditForm.monthlyPayment}
                onChange={(e) =>
                  setCreditForm({ ...creditForm, monthlyPayment: e.target.value })
                }
                required
              />
            </label>
            <div className="field-row">
              <label className="field">
                <span>Начало</span>
                <input
                  type="date"
                  value={creditForm.startDate}
                  onChange={(e) =>
                    setCreditForm({ ...creditForm, startDate: e.target.value })
                  }
                  required
                />
              </label>
              <label className="field">
                <span>Окончание</span>
                <input
                  type="date"
                  value={creditForm.endDate}
                  onChange={(e) =>
                    setCreditForm({ ...creditForm, endDate: e.target.value })
                  }
                />
              </label>
            </div>
            <label className="field">
              <span>Комментарий</span>
              <input
                type="text"
                value={creditForm.comment}
                onChange={(e) => setCreditForm({ ...creditForm, comment: e.target.value })}
              />
            </label>
          </>
        ) : (
          <>
            <label className="field">
              <span>Название</span>
              <input
                type="text"
                value={depositForm.title}
                onChange={(e) => setDepositForm({ ...depositForm, title: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Банк</span>
              <input
                type="text"
                value={depositForm.bank}
                onChange={(e) => setDepositForm({ ...depositForm, bank: e.target.value })}
                required
              />
            </label>
            <div className="field-row">
              <label className="field">
                <span>Сумма, ₽</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={depositForm.amount}
                  onChange={(e) =>
                    setDepositForm({ ...depositForm, amount: e.target.value })
                  }
                  required
                />
              </label>
              <label className="field">
                <span>Ставка, %</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={depositForm.rate}
                  onChange={(e) => setDepositForm({ ...depositForm, rate: e.target.value })}
                  required
                />
              </label>
            </div>
            <div className="field-row">
              <label className="field">
                <span>Начало</span>
                <input
                  type="date"
                  value={depositForm.startDate}
                  onChange={(e) =>
                    setDepositForm({ ...depositForm, startDate: e.target.value })
                  }
                  required
                />
              </label>
              <label className="field">
                <span>Окончание</span>
                <input
                  type="date"
                  value={depositForm.endDate}
                  onChange={(e) =>
                    setDepositForm({ ...depositForm, endDate: e.target.value })
                  }
                />
              </label>
            </div>
            <label className="field">
              <span>Комментарий</span>
              <input
                type="text"
                value={depositForm.comment}
                onChange={(e) =>
                  setDepositForm({ ...depositForm, comment: e.target.value })
                }
              />
            </label>
          </>
        )}
      </Modal>
    </div>
  )
}
