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
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) return NaN
    return Math.round(raw * 100) / 100
  }
  const cleaned = String(raw)
    .replace(/\u00a0/g, '')
    .replace(/\s/g, '')
    .replace(',', '.')
  if (!cleaned || cleaned === '-' || cleaned === '.') return NaN
  const value = Number(cleaned)
  if (!Number.isFinite(value)) return NaN
  return Math.round(value * 100) / 100
}

/** Formats amount for input: `51 910,47` */
export function formatMoneyInput(raw: string): string {
  const normalized = raw.replace(/\u00a0/g, ' ').replace(/\./g, ',')
  if (!normalized.trim()) return ''

  const negative = normalized.trimStart().startsWith('-')
  const body = normalized.replace(/[^\d,]/g, '')
  if (!body) return negative ? '-' : ''

  const commaIdx = body.indexOf(',')
  let intPart = commaIdx === -1 ? body : body.slice(0, commaIdx)
  const fracRaw = commaIdx === -1 ? null : body.slice(commaIdx + 1).replace(/\D/g, '').slice(0, 2)

  intPart = intPart.replace(/^0+(?=\d)/, '')
  if (!intPart) intPart = '0'

  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  let result = withSpaces
  if (fracRaw !== null) result += `,${fracRaw}`
  return negative ? `-${result}` : result
}

export function toMoneyInput(value: number | string | null | undefined): string {
  if (value === '' || value == null) return ''
  const n = typeof value === 'number' ? value : parseMoney(value)
  if (!Number.isFinite(n)) return ''
  const negative = n < 0
  const [intPart, frac = '00'] = Math.abs(n).toFixed(2).split('.')
  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  const result = frac === '00' ? withSpaces : `${withSpaces},${frac}`
  return negative ? `-${result}` : result
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
  return toLocalIso(new Date())
}

export function toLocalIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function monthStartIso(date = new Date()): string {
  return toLocalIso(new Date(date.getFullYear(), date.getMonth(), 1))
}

export function monthEndIso(date = new Date()): string {
  return toLocalIso(new Date(date.getFullYear(), date.getMonth() + 1, 0))
}

export function shiftMonth(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1)
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
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

