import { formatMoneyInput, parseMoney, toMoneyInput } from '../utils'

type MoneyInputProps = {
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
}

export function MoneyInput({
  value,
  onChange,
  required,
  placeholder = '0,00',
}: MoneyInputProps) {
  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(formatMoneyInput(e.target.value))}
      onBlur={() => {
        if (!value.trim() || value === '-') return
        const amount = parseMoney(value)
        if (Number.isFinite(amount)) onChange(toMoneyInput(amount))
      }}
      required={required}
    />
  )
}
