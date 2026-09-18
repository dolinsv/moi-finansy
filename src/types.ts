export type FundType = 'cash' | 'card' | 'account'

export type CreditKind = 'loan' | 'installment'

export type CardKind = 'debit' | 'credit'

export interface FamilyMember {
  id: string
  name: string
  birthDate: string
  phone: string
  login: string
  password: string
  vkId?: number
}

export interface IncomeType {
  id: string
  name: string
}

export interface ExpenseType {
  id: string
  name: string
}

export interface BankCard {
  id: string
  name: string
  last4: string
  memberId: string
  cardKind: CardKind
  creditLimit?: number
}

export interface Income {
  id: string
  date: string
  memberId: string
  incomeTypeId: string
  fundType: FundType
  cardId?: string
  amount: number
  comment?: string
}

export interface Expense {
  id: string
  date: string
  memberId: string
  expenseTypeId: string
  fundType: FundType
  cardId?: string
  amount: number
  comment?: string
}

export interface Credit {
  id: string
  title: string
  kind: CreditKind
  creditor: string
  totalAmount: number
  remainingAmount: number
  monthlyPayment: number
  startDate: string
  endDate?: string
  comment?: string
}

export interface Deposit {
  id: string
  title: string
  bank: string
  amount: number
  rate: number
  startDate: string
  endDate?: string
  comment?: string
}

export interface AppData {
  members: FamilyMember[]
  incomeTypes: IncomeType[]
  expenseTypes: ExpenseType[]
  cards: BankCard[]
  incomes: Income[]
  expenses: Expense[]
  credits: Credit[]
  deposits: Deposit[]
}

export type ReportKind = 'income' | 'expense' | 'credits' | 'deposits'
