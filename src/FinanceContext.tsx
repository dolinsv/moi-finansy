import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  isSupabaseConfigured,
  loadRemoteState,
  saveRemoteState,
  subscribeRemoteState,
} from './lib/supabase'
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

type CloudStatus = {
  configured: boolean
  ready: boolean
  label: string
}

interface FinanceContextValue {
  data: AppData
  currentUser: FamilyMember | null
  authReady: boolean
  isVkMiniApp: boolean
  vkUser: VkUser | null
  cloud: CloudStatus
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
const UPDATED_KEY = 'moi-finansy-cloud-updated-at'

function withId<T extends object>(item: T): T & { id: string } {
  return { ...item, id: crypto.randomUUID() }
}

function vkDisplayName(user: VkUser) {
  return (
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
    'Пользователь ВК'
  )
}

function getLocalUpdatedAt() {
  return Number(localStorage.getItem(UPDATED_KEY) || '0')
}

function setLocalUpdatedAt(ts: number) {
  localStorage.setItem(UPDATED_KEY, String(ts))
}

export function FinanceProvider({
  children,
  onVkTheme,
}: {
  children: ReactNode
  onVkTheme?: (theme: 'light' | 'dark') => void
}) {
  const isVkMiniApp = useMemo(() => isVkEnvironment(), [])
  const configured = isSupabaseConfigured()
  const [data, setData] = useState<AppData>(() => loadData())
  const [sessionId, setSessionId] = useState<string | null>(() =>
    isVkMiniApp ? null : loadSession(),
  )
  const [vkUser, setVkUser] = useState<VkUser | null>(null)
  const [authReady, setAuthReady] = useState(!isVkMiniApp)
  const [cloudReady, setCloudReady] = useState(!configured)
  const [cloudLabel, setCloudLabel] = useState(
    configured ? 'Подключение к облаку…' : 'Локальный режим (облако не настроено)',
  )

  const dataRef = useRef(data)
  const updatedAtRef = useRef(getLocalUpdatedAt())
  const pushTimer = useRef<number | null>(null)
  const applyingRemote = useRef(false)

  useEffect(() => {
    dataRef.current = data
  }, [data])

  const applyData = useCallback((next: AppData, updatedAt: number, fromRemote = false) => {
    if (fromRemote) applyingRemote.current = true
    updatedAtRef.current = updatedAt
    setLocalUpdatedAt(updatedAt)
    saveData(next)
    setData(next)
    if (fromRemote) {
      window.setTimeout(() => {
        applyingRemote.current = false
      }, 30)
    }
  }, [])

  const scheduleRemoteSave = useCallback((next: AppData) => {
    if (!configured || applyingRemote.current) return

    const updatedAt = Date.now()
    updatedAtRef.current = updatedAt
    setLocalUpdatedAt(updatedAt)
    setCloudLabel('Сохранение…')

    if (pushTimer.current) window.clearTimeout(pushTimer.current)
    pushTimer.current = window.setTimeout(async () => {
      try {
        await saveRemoteState(next, updatedAt)
        setCloudLabel('Облако синхронизировано')
      } catch (e) {
        setCloudLabel(
          e instanceof Error ? `Ошибка облака: ${e.message}` : 'Ошибка облака',
        )
      }
    }, 500)
  }, [configured])

  const commit = useCallback(
    (updater: (prev: AppData) => AppData) => {
      setData((prev) => {
        const next = updater(prev)
        saveData(next)
        scheduleRemoteSave(next)
        return next
      })
    },
    [scheduleRemoteSave],
  )

  useEffect(() => {
    if (!configured) return

    let cancelled = false
    ;(async () => {
      try {
        const remote = await loadRemoteState()
        if (cancelled) return

        if (!remote) {
          const local = dataRef.current
          const updatedAt = Date.now()
          await saveRemoteState(local, updatedAt)
          updatedAtRef.current = updatedAt
          setLocalUpdatedAt(updatedAt)
          setCloudLabel('Данные выгружены в облако')
        } else if (remote.updatedAt >= updatedAtRef.current) {
          applyData(remote.data, remote.updatedAt, true)
          setCloudLabel('Данные загружены из облака')
        } else {
          await saveRemoteState(dataRef.current, updatedAtRef.current || Date.now())
          setCloudLabel('Локальные данные отправлены в облако')
        }
      } catch (e) {
        if (!cancelled) {
          setCloudLabel(
            e instanceof Error
              ? `Облако недоступно: ${e.message}`
              : 'Облако недоступно',
          )
        }
      } finally {
        if (!cancelled) setCloudReady(true)
      }
    })()

    const unsubscribe = subscribeRemoteState((payload, updatedAt) => {
      if (updatedAt <= updatedAtRef.current) return
      applyData(payload, updatedAt, true)
      setCloudLabel('Обновлено с другого устройства')
    })

    return () => {
      cancelled = true
      unsubscribe()
      if (pushTimer.current) window.clearTimeout(pushTimer.current)
    }
  }, [applyData, configured])

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
      scheduleRemoteSave(next)
      setSessionId(member.id)
      saveSession(member.id)
      return next
    })
    setVkUser(user)
  }, [scheduleRemoteSave])

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

  const cloud = useMemo<CloudStatus>(
    () => ({
      configured,
      ready: cloudReady,
      label: cloudLabel,
    }),
    [cloudLabel, cloudReady, configured],
  )

  const value = useMemo<FinanceContextValue>(
    () => ({
      data,
      currentUser,
      authReady: authReady && cloudReady,
      isVkMiniApp,
      vkUser,
      cloud,
      login,
      logout,
      addIncome: (item) =>
        commit((prev) => ({
          ...prev,
          incomes: [withId(item), ...prev.incomes],
        })),
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
          incomeTypes: prev.incomeTypes.map((x) =>
            x.id === item.id ? item : x,
          ),
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
      cloud,
      cloudReady,
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
