import type { FundType } from './types'

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function parseMoney(raw: string | number): number {
  const value = typeof raw === 'number' ? raw : Number(String(raw).replace(',', '.'))
  if (!Number.isFinite(value)) return NaN
  return Math.round(value * 100) / 100
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

/** Имя для приветствия из ФИО («Фамилия Имя Отчество» → Имя). */
export function firstNameFromFio(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]
  return parts[1]
}

/** Маска российского номера: +7 900 123-45-67 */
export function formatPhoneInput(value: string): string {
  const raw = value.trim()
  if (!raw) return ''

  let digits = raw.replace(/\D/g, '')
  if (!digits) return raw.startsWith('+') ? '+' : ''

  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`
  if (!digits.startsWith('7')) digits = `7${digits}`
  digits = digits.slice(0, 11)

  const code = digits.slice(1, 4)
  const mid = digits.slice(4, 7)
  const a = digits.slice(7, 9)
  const b = digits.slice(9, 11)

  let out = '+7'
  if (code) out += ` ${code}`
  if (mid) out += ` ${mid}`
  if (a) out += `-${a}`
  if (b) out += `-${b}`
  return out
}

