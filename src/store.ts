import type { AppData, BankCard, FamilyMember } from './types'

const STORAGE_KEY = 'moi-finansy-data-v4'
const LEGACY_KEYS = ['moi-finansy-data-v3', 'moi-finansy-data-v2', 'moi-finansy-data-v1']
export const SESSION_KEY = 'moi-finansy-session'

function id() {
  return crypto.randomUUID()
}

export function createSeedData(): AppData {
  const members: FamilyMember[] = [
    {
      id: id(),
      name: 'Сергей',
      birthDate: '1988-04-12',
      phone: '+7 900 111-22-33',
      login: 'sergey',
      password: '1234',
    },
    {
      id: id(),
      name: 'Надежда',
      birthDate: '1991-09-03',
      phone: '+7 900 444-55-66',
      login: 'nadezhda',
      password: '1234',
    },
  ]
  const incomeTypes = [
    { id: id(), name: 'Зарплата' },
    { id: id(), name: 'Подработка' },
    { id: id(), name: 'Подарок' },
  ]
  const expenseTypes = [
    { id: id(), name: 'Продукты' },
    { id: id(), name: 'Жильё' },
    { id: id(), name: 'Транспорт' },
    { id: id(), name: 'Развлечения' },
  ]
  const cards: BankCard[] = [
    {
      id: id(),
      name: 'Сбер',
      last4: '4521',
      memberId: members[0].id,
      cardKind: 'debit',
    },
    {
      id: id(),
      name: 'Тинькофф',
      last4: '8890',
      memberId: members[1].id,
      cardKind: 'credit',
      creditLimit: 150000,
    },
  ]

  const today = new Date()
  const d = (offset: number) => {
    const x = new Date(today)
    x.setDate(x.getDate() - offset)
    return x.toISOString().slice(0, 10)
  }

  return {
    members,
    incomeTypes,
    expenseTypes,
    cards,
    incomes: [
      {
        id: id(),
        date: d(2),
        memberId: members[0].id,
        incomeTypeId: incomeTypes[0].id,
        fundType: 'card',
        cardId: cards[0].id,
        amount: 120000,
        comment: 'Аванс',
      },
      {
        id: id(),
        date: d(5),
        memberId: members[1].id,
        incomeTypeId: incomeTypes[0].id,
        fundType: 'account',
        amount: 95000,
      },
    ],
    expenses: [
      {
        id: id(),
        date: d(1),
        memberId: members[0].id,
        expenseTypeId: expenseTypes[0].id,
        fundType: 'cash',
        amount: 3200,
      },
      {
        id: id(),
        date: d(3),
        memberId: members[1].id,
        expenseTypeId: expenseTypes[1].id,
        fundType: 'card',
        cardId: cards[1].id,
        amount: 45000,
        comment: 'Аренда',
      },
    ],
    credits: [
      {
        id: id(),
        title: 'Телевизор',
        kind: 'installment',
        creditor: 'М.Видео',
        totalAmount: 60000,
        remainingAmount: 24000,
        monthlyPayment: 5000,
        startDate: d(90),
        endDate: d(-90),
      },
    ],
    deposits: [
      {
        id: id(),
        title: 'Накопительный',
        bank: 'Сбер',
        amount: 150000,
        rate: 16.5,
        startDate: d(30),
        endDate: d(-335),
      },
    ],
  }
}

function normalize(raw: Partial<AppData>): AppData {
  const seed = createSeedData()
  const members = (raw.members ?? seed.members).map((m, index) => {
    const member = m as FamilyMember
    let name = member.name
    let login = member.login || ''
    if (name === 'Анна') name = 'Надежда'
    if (
      login.toLowerCase() === 'anna' ||
      login.toLowerCase() === 'анна'
    ) {
      login = 'nadezhda'
    }
    const fallbackLogin =
      login ||
      name
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-zа-яё0-9]/gi, '') ||
      `user${index + 1}`
    return {
      id: member.id,
      name,
      birthDate: member.birthDate || '',
      phone: member.phone || '',
      login: fallbackLogin,
      password: member.password || '1234',
    }
  })
  const fallbackMemberId = members[0]?.id ?? ''
  const cards = (raw.cards ?? seed.cards).map((c) => {
    const card = c as BankCard
    return {
      id: card.id,
      name: card.name,
      last4: card.last4,
      memberId: card.memberId || fallbackMemberId,
      cardKind: card.cardKind === 'credit' ? ('credit' as const) : ('debit' as const),
      creditLimit:
        card.cardKind === 'credit' && card.creditLimit
          ? Number(card.creditLimit)
          : undefined,
    }
  })

  return {
    members,
    incomeTypes: raw.incomeTypes ?? seed.incomeTypes,
    expenseTypes: raw.expenseTypes ?? seed.expenseTypes,
    cards,
    incomes: raw.incomes ?? seed.incomes,
    expenses: raw.expenses ?? seed.expenses,
    credits: raw.credits ?? seed.credits,
    deposits: raw.deposits ?? seed.deposits,
  }
}

export function loadData(): AppData {
  try {
    let raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      for (const key of LEGACY_KEYS) {
        raw = localStorage.getItem(key)
        if (raw) break
      }
    }
    if (!raw) {
      const seed = createSeedData()
      saveData(seed)
      return seed
    }
    const data = normalize(JSON.parse(raw) as Partial<AppData>)
    saveData(data)
    return data
  } catch {
    const seed = createSeedData()
    saveData(seed)
    return seed
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function loadSession(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function saveSession(memberId: string | null) {
  if (!memberId) localStorage.removeItem(SESSION_KEY)
  else localStorage.setItem(SESSION_KEY, memberId)
}
