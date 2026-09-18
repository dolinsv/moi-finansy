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

type CloudStatus = {
  configured: boolean
  ready: boolean
  label: string
}

interface FinanceContextValue {
  data: AppData
  currentUser: FamilyMember | null
  authReady: boolean
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

function getLocalUpdatedAt() {
  return Number(localStorage.getItem(UPDATED_KEY) || '0')
}

function setLocalUpdatedAt(ts: number) {
  localStorage.setItem(UPDATED_KEY, String(ts))
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured()
  const [data, setData] = useState<AppData>(() => loadData())
  const [sessionId, setSessionId] = useState<string | null>(() => loadSession())
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

  const applyData = useCallback(
    (next: AppData, updatedAt: number, fromRemote = false) => {
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
    },
    [],
  )

  const scheduleRemoteSave = useCallback(
    (next: AppData) => {
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
    },
    [configured],
  )

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
    let unsubscribe = () => {}

    const pullFromCloud = async (reason: string) => {
      try {
        const remote = await loadRemoteState()
        if (cancelled) return

        if (!remote) {
          const updatedAt = Date.now()
          await saveRemoteState(dataRef.current, updatedAt)
          updatedAtRef.current = updatedAt
          setLocalUpdatedAt(updatedAt)
          setCloudLabel('Данные выгружены в облако')
          return
        }

        if (remote.updatedAt > updatedAtRef.current) {
          applyData(remote.data, remote.updatedAt, true)
          setCloudLabel(
            reason === 'live'
              ? 'Обновлено с другого устройства'
              : 'Данные загружены из облака',
          )
        } else if (remote.updatedAt < updatedAtRef.current) {
          await saveRemoteState(
            dataRef.current,
            updatedAtRef.current || Date.now(),
          )
          setCloudLabel('Локальные данные отправлены в облако')
        } else {
          setCloudLabel('Облако синхронизировано')
        }
      } catch (e) {
        if (!cancelled) {
          setCloudLabel(
            e instanceof Error
              ? `Облако недоступно: ${e.message}`
              : 'Облако недоступно',
          )
        }
      }
    }

    ;(async () => {
      await pullFromCloud('start')
      if (!cancelled) setCloudReady(true)
    })()

    unsubscribe = subscribeRemoteState((payload, updatedAt) => {
      if (updatedAt <= updatedAtRef.current) return
      applyData(payload, updatedAt, true)
      setCloudLabel('Обновлено с другого устройства')
    })

    const onResume = () => {
      if (document.visibilityState && document.visibilityState !== 'visible') {
        return
      }
      void pullFromCloud('resume')
      unsubscribe()
      unsubscribe = subscribeRemoteState((payload, updatedAt) => {
        if (updatedAt <= updatedAtRef.current) return
        applyData(payload, updatedAt, true)
        setCloudLabel('Обновлено с другого устройства')
      })
    }

    const poll = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return
      void pullFromCloud('poll')
    }, 4000)

    document.addEventListener('visibilitychange', onResume)
    window.addEventListener('focus', onResume)
    window.addEventListener('pageshow', onResume)

    return () => {
      cancelled = true
      unsubscribe()
      window.clearInterval(poll)
      document.removeEventListener('visibilitychange', onResume)
      window.removeEventListener('focus', onResume)
      window.removeEventListener('pageshow', onResume)
      if (pushTimer.current) window.clearTimeout(pushTimer.current)
    }
  }, [applyData, configured])

  const currentUser = useMemo(
    () => data.members.find((m) => m.id === sessionId) ?? null,
    [data.members, sessionId],
  )

  const login = useCallback(
    (loginName: string, password: string) => {
      const normalized = loginName.trim().toLowerCase()
      const member = data.members.find(
        (m) =>
          Boolean(m.login) &&
          m.login.toLowerCase() === normalized &&
          m.password === password,
      )
      if (!member) return 'Неверный логин или пароль'
      setSessionId(member.id)
      saveSession(member.id)
      return null
    },
    [data.members],
  )

  const logout = useCallback(() => {
    setSessionId(null)
    saveSession(null)
  }, [])

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
      authReady: cloudReady,
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
      cloud,
      cloudReady,
      commit,
      currentUser,
      data,
      login,
      logout,
      sessionId,
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
