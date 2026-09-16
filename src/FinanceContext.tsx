import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { loadData, loadSession, saveData, saveSession } from './store'
import type {
  AppData,
  BankCard,
  Credit,
  Deposit,
  Expense,
  ExpenseType,
  FamilyMember,
  Income,
  IncomeType,
} from './types'
import {
  applyVkInsets,
  getVkAppearance,
  getVkUser,
  initVkBridge,
  isVkEnvironment,
  subscribeVkConfig,
  type VkUser,
} from './vk'

interface FinanceContextValue {
  data: AppData
  currentUser: FamilyMember | null
  authReady: boolean
  isVkMiniApp: boolean
  vkUser: VkUser | null
  login: (loginName: string, password: string) => string | null
  logout: () => void
  addIncome: (item: Omit<Income, 'id'>) => void
  updateIncome: (item: Income) => void
  removeIncome: (id: string) => void
  addExpense: (item: Omit<Expense, 'id'>) => void
  updateExpense: (item: Expense) => void
  removeExpense: (id: string) => void
  addMember: (item: Omit<FamilyMember, 'id'>) => void
  updateMember: (item: FamilyMember) => void
  removeMember: (id: string) => void
  addIncomeType: (name: string) => void
  updateIncomeType: (item: IncomeType) => void
  removeIncomeType: (id: string) => void
  addExpenseType: (name: string) => void
  updateExpenseType: (item: ExpenseType) => void
  removeExpenseType: (id: string) => void
  addCard: (item: Omit<BankCard, 'id'>) => void
  updateCard: (item: BankCard) => void
  removeCard: (id: string) => void
  addCredit: (item: Omit<Credit, 'id'>) => void
  updateCredit: (item: Credit) => void
  removeCredit: (id: string) => void
  addDeposit: (item: Omit<Deposit, 'id'>) => void
  updateDeposit: (item: Deposit) => void
  removeDeposit: (id: string) => void
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

function withId<T extends object>(item: T): T & { id: string } {
  return { ...item, id: crypto.randomUUID() }
}

function vkDisplayName(user: VkUser) {
  return [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || 'Пользователь ВК'
}

export function FinanceProvider({
  children,
  onVkTheme,
}: {
  children: ReactNode
  onVkTheme?: (theme: 'light' | 'dark') => void
}) {
  const isVkMiniApp = useMemo(() => isVkEnvironment(), [])
  const [data, setData] = useState<AppData>(() => loadData())
  const [sessionId, setSessionId] = useState<string | null>(() =>
    isVkMiniApp ? null : loadSession(),
  )
  const [vkUser, setVkUser] = useState<VkUser | null>(null)
  const [authReady, setAuthReady] = useState(!isVkMiniApp)

  const commit = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => {
      const next = updater(prev)
      saveData(next)
      return next
    })
  }, [])

  const currentUser = useMemo(
    () => data.members.find((m) => m.id === sessionId) ?? null,
    [data.members, sessionId],
  )

  const loginWithVkUser = useCallback((user: VkUser) => {
    const name = vkDisplayName(user)
    setData((prev) => {
      let member = prev.members.find((m) => m.vkId === user.id)
      let nextMembers = prev.members

      if (!member) {
        member = {
          id: crypto.randomUUID(),
          name,
          birthDate: '',
          phone: '',
          login: `vk_${user.id}`,
          password: crypto.randomUUID(),
          vkId: user.id,
        }
        nextMembers = [...prev.members, member]
      } else if (member.name !== name) {
        member = { ...member, name }
        nextMembers = prev.members.map((m) =>
          m.id === member!.id ? member! : m,
        )
      }

      const next = { ...prev, members: nextMembers }
      saveData(next)
      setSessionId(member.id)
      saveSession(member.id)
      return next
    })
    setVkUser(user)
  }, [])

  useEffect(() => {
    if (!isVkMiniApp) return

    let cancelled = false
    ;(async () => {
      await initVkBridge()
      const appearance = await getVkAppearance()
      if (!cancelled && appearance) onVkTheme?.(appearance)

      const user = await getVkUser()
      if (cancelled) return
      if (user) loginWithVkUser(user)
      setAuthReady(true)
    })()

    const unsubscribe = subscribeVkConfig((payload) => {
      if (payload.appearance === 'light' || payload.appearance === 'dark') {
        onVkTheme?.(payload.appearance)
      }
      if (payload.insets) applyVkInsets(payload.insets)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [isVkMiniApp, loginWithVkUser, onVkTheme])

  const login = useCallback(
    (loginName: string, password: string) => {
      const normalized = loginName.trim().toLowerCase()
      const member = data.members.find(
        (m) => m.login.toLowerCase() === normalized && m.password === password,
      )
      if (!member) return 'Неверный логин или пароль'
      setSessionId(member.id)
      saveSession(member.id)
      return null
    },
    [data.members],
  )

  const logout = useCallback(() => {
    if (isVkMiniApp) return
    setSessionId(null)
    saveSession(null)
  }, [isVkMiniApp])

  const value = useMemo<FinanceContextValue>(
    () => ({
      data,
      currentUser,
      authReady,
      isVkMiniApp,
      vkUser,
      login,
      logout,
      addIncome: (item) =>
        commit((prev) => ({ ...prev, incomes: [withId(item), ...prev.incomes] })),
      updateIncome: (item) =>
        commit((prev) => ({
          ...prev,
          incomes: prev.incomes.map((x) => (x.id === item.id ? item : x)),
        })),
      removeIncome: (id) =>
        commit((prev) => ({
          ...prev,
          incomes: prev.incomes.filter((x) => x.id !== id),
        })),
      addExpense: (item) =>
        commit((prev) => ({
          ...prev,
          expenses: [withId(item), ...prev.expenses],
        })),
      updateExpense: (item) =>
        commit((prev) => ({
          ...prev,
          expenses: prev.expenses.map((x) => (x.id === item.id ? item : x)),
        })),
      removeExpense: (id) =>
        commit((prev) => ({
          ...prev,
          expenses: prev.expenses.filter((x) => x.id !== id),
        })),
      addMember: (item) =>
        commit((prev) => ({
          ...prev,
          members: [...prev.members, withId(item)],
        })),
      updateMember: (item) =>
        commit((prev) => ({
          ...prev,
          members: prev.members.map((x) => (x.id === item.id ? item : x)),
        })),
      removeMember: (id) => {
        commit((prev) => ({
          ...prev,
          members: prev.members.filter((x) => x.id !== id),
        }))
        if (sessionId === id) {
          setSessionId(null)
          saveSession(null)
        }
      },
      addIncomeType: (name) =>
        commit((prev) => ({
          ...prev,
          incomeTypes: [...prev.incomeTypes, withId({ name })],
        })),
      updateIncomeType: (item) =>
        commit((prev) => ({
          ...prev,
          incomeTypes: prev.incomeTypes.map((x) => (x.id === item.id ? item : x)),
        })),
      removeIncomeType: (id) =>
        commit((prev) => ({
          ...prev,
          incomeTypes: prev.incomeTypes.filter((x) => x.id !== id),
        })),
      addExpenseType: (name) =>
        commit((prev) => ({
          ...prev,
          expenseTypes: [...prev.expenseTypes, withId({ name })],
        })),
      updateExpenseType: (item) =>
        commit((prev) => ({
          ...prev,
          expenseTypes: prev.expenseTypes.map((x) =>
            x.id === item.id ? item : x,
          ),
        })),
      removeExpenseType: (id) =>
        commit((prev) => ({
          ...prev,
          expenseTypes: prev.expenseTypes.filter((x) => x.id !== id),
        })),
      addCard: (item) =>
        commit((prev) => ({
          ...prev,
          cards: [...prev.cards, withId(item)],
        })),
      updateCard: (item) =>
        commit((prev) => ({
          ...prev,
          cards: prev.cards.map((x) => (x.id === item.id ? item : x)),
        })),
      removeCard: (id) =>
        commit((prev) => ({
          ...prev,
          cards: prev.cards.filter((x) => x.id !== id),
        })),
      addCredit: (item) =>
        commit((prev) => ({
          ...prev,
          credits: [withId(item), ...prev.credits],
        })),
      updateCredit: (item) =>
        commit((prev) => ({
          ...prev,
          credits: prev.credits.map((x) => (x.id === item.id ? item : x)),
        })),
      removeCredit: (id) =>
        commit((prev) => ({
          ...prev,
          credits: prev.credits.filter((x) => x.id !== id),
        })),
      addDeposit: (item) =>
        commit((prev) => ({
          ...prev,
          deposits: [withId(item), ...prev.deposits],
        })),
      updateDeposit: (item) =>
        commit((prev) => ({
          ...prev,
          deposits: prev.deposits.map((x) => (x.id === item.id ? item : x)),
        })),
      removeDeposit: (id) =>
        commit((prev) => ({
          ...prev,
          deposits: prev.deposits.filter((x) => x.id !== id),
        })),
    }),
    [
      authReady,
      commit,
      currentUser,
      data,
      isVkMiniApp,
      login,
      logout,
      sessionId,
      vkUser,
    ],
  )

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  )
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}
