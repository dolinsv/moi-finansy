import type { FundType } from './types'

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(iso: string): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

export function fundTypeLabel(type: FundType): string {
  switch (type) {
    case 'cash':
      return 'Наличные'
    case 'card':
      return 'Банковская карта'
    case 'account':
      return 'Банковский счёт'
  }
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function monthStartIso(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

export function monthLabel(date = new Date()): string {
  return new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function daysInMonth(date = new Date()): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

export function dayOfMonth(date = new Date()): number {
  return date.getDate()
}

export function sumBy<T>(items: T[], getAmount: (item: T) => number): number {
  return items.reduce((acc, item) => acc + getAmount(item), 0)
}
