import { useMemo, useState } from 'react'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { RowActions } from '../components/RowActions'
import { useFinance } from '../FinanceContext'
import type {
  BankCard,
  CardKind,
  ExpenseType,
  FamilyMember,
  IncomeType,
} from '../types'
import { formatDate, formatMoney } from '../utils'

type Tab = 'members' | 'incomeTypes' | 'expenseTypes' | 'cards'

const emptyMember = () => ({
  name: '',
  birthDate: '',
  phone: '',
  login: '',
  password: '',
})

const emptyCard = (memberId = '') => ({
  name: '',
  last4: '',
  memberId,
  cardKind: 'debit' as CardKind,
  creditLimit: '',
})

export function DirectoriesPage() {
  const {
    data,
    addMember,
    updateMember,
    removeMember,
    addIncomeType,
    updateIncomeType,
    removeIncomeType,
    addExpenseType,
    updateExpenseType,
    removeExpenseType,
    addCard,
    updateCard,
    removeCard,
  } = useFinance()

  const [tab, setTab] = useState<Tab>('members')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [simpleName, setSimpleName] = useState('')
  const [memberForm, setMemberForm] = useState(emptyMember)
  const [cardForm, setCardForm] = useState(emptyCard)

  const memberMap = useMemo(
    () => Object.fromEntries(data.members.map((m) => [m.id, m.name])),
    [data.members],
  )

  const tabs: { id: Tab; label: string; short: string }[] = [
    { id: 'members', label: 'Члены семьи', short: 'Семья' },
    { id: 'incomeTypes', label: 'Виды доходов', short: 'Доходы' },
    { id: 'expenseTypes', label: 'Виды расходов', short: 'Расходы' },
    { id: 'cards', label: 'Банковские карты', short: 'Карты' },
  ]

  const titles: Record<Tab, string> = {
    members: 'Член семьи',
    incomeTypes: 'Вид дохода',
    expenseTypes: 'Вид расхода',
    cards: 'Банковская карта',
  }

  const openCreate = () => {
    setEditingId(null)
    setSimpleName('')
    setMemberForm(emptyMember())
    setCardForm(emptyCard(data.members[0]?.id ?? ''))
    setOpen(true)
  }

  const openEdit = (item: FamilyMember | IncomeType | ExpenseType | BankCard) => {
    setEditingId(item.id)
    if (tab === 'members') {
      const m = item as FamilyMember
      setMemberForm({
        name: m.name,
        birthDate: m.birthDate,
        phone: m.phone,
        login: m.login,
        password: m.password,
      })
    } else if (tab === 'cards') {
      const c = item as BankCard
      setCardForm({
        name: c.name,
        last4: c.last4,
        memberId: c.memberId,
        cardKind: c.cardKind,
        creditLimit: c.creditLimit ? String(c.creditLimit) : '',
      })
    } else {
      setSimpleName(item.name)
    }
    setOpen(true)
  }

  const save = () => {
    if (tab === 'members') {
      const name = memberForm.name.trim()
      const login = memberForm.login.trim().toLowerCase()
      const password = memberForm.password
      if (!name || !login || !password) return
      const duplicate = data.members.some(
        (m) => m.login.toLowerCase() === login && m.id !== editingId,
      )
      if (duplicate) return
      const payload = {
        name,
        birthDate: memberForm.birthDate,
        phone: memberForm.phone.trim(),
        login,
        password,
      }
      if (editingId) updateMember({ id: editingId, ...payload })
      else addMember(payload)
    } else if (tab === 'incomeTypes') {
      const name = simpleName.trim()
      if (!name) return
      if (editingId) updateIncomeType({ id: editingId, name })
      else addIncomeType(name)
    } else if (tab === 'expenseTypes') {
      const name = simpleName.trim()
      if (!name) return
      if (editingId) updateExpenseType({ id: editingId, name })
      else addExpenseType(name)
    } else {
      const name = cardForm.name.trim()
      const digits = cardForm.last4.replace(/\D/g, '').slice(-4)
      if (!name || digits.length !== 4 || !cardForm.memberId) return
      if (cardForm.cardKind === 'credit') {
        const limit = Number(cardForm.creditLimit)
        if (!limit || limit <= 0) return
      }
      const payload: Omit<BankCard, 'id'> = {
        name,
        last4: digits,
        memberId: cardForm.memberId,
        cardKind: cardForm.cardKind,
        creditLimit:
          cardForm.cardKind === 'credit'
            ? Number(cardForm.creditLimit)
            : undefined,
      }
      if (editingId) updateCard({ id: editingId, ...payload })
      else addCard(payload)
    }
    setOpen(false)
  }

  const remove = (id: string) => {
    if (tab === 'members') removeMember(id)
    else if (tab === 'incomeTypes') removeIncomeType(id)
    else if (tab === 'expenseTypes') removeExpenseType(id)
    else removeCard(id)
  }

  return (
    <div className="page fade-in">
      <PageHeader
        title="Справочники"
        subtitle="Базовые списки для документов"
        action={
          <button type="button" className="btn primary" onClick={openCreate}>
            Добавить
          </button>
        }
      />

      <div className="segmented segmented-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'seg active' : 'seg'}
            onClick={() => setTab(t.id)}
          >
            <span className="seg-full">{t.label}</span>
            <span className="seg-short">{t.short}</span>
          </button>
        ))}
      </div>

      {tab === 'members' ? (
        <div className="table-wrap">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Логин</th>
                <th>Дата рождения</th>
                <th>Телефон</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty">
                    Список пуст
                  </td>
                </tr>
              ) : (
                data.members.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Имя">
                      <strong>{item.name}</strong>
                    </td>
                    <td data-label="Логин">{item.login}</td>
                    <td data-label="Дата рождения">
                      {item.birthDate ? formatDate(item.birthDate) : '—'}
                    </td>
                    <td data-label="Телефон">{item.phone || '—'}</td>
                    <td className="actions-cell">
                      <RowActions
                        onEdit={() => openEdit(item)}
                        onDelete={() => remove(item.id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === 'cards' ? (
        <div className="table-wrap">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Карта</th>
                <th>Владелец</th>
                <th>Тип</th>
                <th>Лимит</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.cards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty">
                    Список пуст
                  </td>
                </tr>
              ) : (
                data.cards.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Карта">
                      <strong>{item.name}</strong>
                      <span className="muted"> •••• {item.last4}</span>
                    </td>
                    <td data-label="Владелец">{memberMap[item.memberId] ?? '—'}</td>
                    <td data-label="Тип">
                      {item.cardKind === 'credit' ? 'Кредитная' : 'Дебетовая'}
                    </td>
                    <td data-label="Лимит">
                      {item.cardKind === 'credit' && item.creditLimit
                        ? formatMoney(item.creditLimit)
                        : '—'}
                    </td>
                    <td className="actions-cell">
                      <RowActions
                        onEdit={() => openEdit(item)}
                        onDelete={() => remove(item.id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {(tab === 'incomeTypes' || tab === 'expenseTypes') && (
        <div className="data-list">
          {(tab === 'incomeTypes' ? data.incomeTypes : data.expenseTypes)
            .length === 0 ? (
            <p className="empty-block">Список пуст</p>
          ) : (
            (tab === 'incomeTypes' ? data.incomeTypes : data.expenseTypes).map(
              (item) => (
                <article key={item.id} className="data-item">
                  <strong className="data-item-title">{item.name}</strong>
                  <RowActions
                    onEdit={() => openEdit(item)}
                    onDelete={() => remove(item.id)}
                  />
                </article>
              ),
            )
          )}
        </div>
      )}

      <Modal
        title={editingId ? `Изменить: ${titles[tab]}` : `Новый: ${titles[tab]}`}
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={save}
      >
        {tab === 'members' ? (
          <>
            <label className="field">
              <span>Имя</span>
              <input
                type="text"
                value={memberForm.name}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, name: e.target.value })
                }
                required
                autoFocus
              />
            </label>
            <label className="field">
              <span>Дата рождения</span>
              <input
                type="date"
                value={memberForm.birthDate}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, birthDate: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Телефон</span>
              <input
                type="tel"
                value={memberForm.phone}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, phone: e.target.value })
                }
                placeholder="+7 ..."
              />
            </label>
            <label className="field">
              <span>Логин</span>
              <input
                type="text"
                autoComplete="off"
                value={memberForm.login}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, login: e.target.value })
                }
                required
              />
            </label>
            <label className="field">
              <span>Пароль</span>
              <input
                type="text"
                autoComplete="new-password"
                value={memberForm.password}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, password: e.target.value })
                }
                required
              />
            </label>
          </>
        ) : null}

        {tab === 'cards' ? (
          <>
            <label className="field">
              <span>Название</span>
              <input
                type="text"
                value={cardForm.name}
                onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                required
                autoFocus
              />
            </label>
            <label className="field">
              <span>Последние 4 цифры</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={cardForm.last4}
                onChange={(e) =>
                  setCardForm({
                    ...cardForm,
                    last4: e.target.value.replace(/\D/g, '').slice(0, 4),
                  })
                }
                required
                placeholder="1234"
              />
            </label>
            <label className="field">
              <span>Владелец</span>
              <select
                value={cardForm.memberId}
                onChange={(e) =>
                  setCardForm({ ...cardForm, memberId: e.target.value })
                }
                required
              >
                <option value="">Выберите члена семьи</option>
                {data.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Тип карты</span>
              <select
                value={cardForm.cardKind}
                onChange={(e) =>
                  setCardForm({
                    ...cardForm,
                    cardKind: e.target.value as CardKind,
                    creditLimit:
                      e.target.value === 'debit' ? '' : cardForm.creditLimit,
                  })
                }
              >
                <option value="debit">Дебетовая</option>
                <option value="credit">Кредитная</option>
              </select>
            </label>
            {cardForm.cardKind === 'credit' ? (
              <label className="field">
                <span>Кредитный лимит, ₽</span>
                <input
                  type="number"
                  min="1"
                  value={cardForm.creditLimit}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, creditLimit: e.target.value })
                  }
                  required
                />
              </label>
            ) : null}
          </>
        ) : null}

        {(tab === 'incomeTypes' || tab === 'expenseTypes') && (
          <label className="field">
            <span>Название</span>
            <input
              type="text"
              value={simpleName}
              onChange={(e) => setSimpleName(e.target.value)}
              required
              autoFocus
            />
          </label>
        )}
      </Modal>
    </div>
  )
}
