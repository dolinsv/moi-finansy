type IconProps = { size?: number }

const stroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function LogoutIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="M10 4.5H8A3.5 3.5 0 0 0 4.5 8v8A3.5 3.5 0 0 0 8 19.5h2" />
      <path {...stroke} d="M14.5 8.5 18.5 12l-4 3.5M10 12h8.5" />
    </svg>
  )
}

export function SunIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle {...stroke} cx="12" cy="12" r="4" />
      <path
        {...stroke}
        d="M12 3.5v1.4M12 19.1V20.5M3.5 12H4.9M19.1 12h1.4M6.4 6.4l1 1M16.6 16.6l1 1M17.6 6.4l-1 1M7.4 16.6l-1 1"
      />
    </svg>
  )
}

export function MoonIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="M19.2 13.4A7.2 7.2 0 1 1 10.6 4.8 6 6 0 0 0 19.2 13.4Z" />
    </svg>
  )
}

export function HomeIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        {...stroke}
        d="M4.8 11.2 11.2 5.4a1.2 1.2 0 0 1 1.6 0l6.4 5.8"
      />
      <path
        {...stroke}
        d="M7.2 10.8V18a1.8 1.8 0 0 0 1.8 1.8h2.4v-4.2a1.2 1.2 0 0 1 1.2-1.2h.8a1.2 1.2 0 0 1 1.2 1.2V19.8h2.4A1.8 1.8 0 0 0 18.8 18v-7.2"
      />
    </svg>
  )
}

export function IncomeIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="M12 16.5V6.5" />
      <path {...stroke} d="M8.2 9.8c1.1-1.2 2.4-2.5 3.8-3.3 1.4.8 2.7 2.1 3.8 3.3" />
      <path {...stroke} d="M6.5 18.5h11" />
    </svg>
  )
}

export function ExpenseIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="M12 7.5v10" />
      <path {...stroke} d="M8.2 14.2c1.1 1.2 2.4 2.5 3.8 3.3 1.4-.8 2.7-2.1 3.8-3.3" />
      <path {...stroke} d="M6.5 5.5h11" />
    </svg>
  )
}

export function ReportIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect {...stroke} x="4.5" y="12" width="3.2" height="6" rx="1.5" />
      <rect {...stroke} x="10.4" y="8" width="3.2" height="10" rx="1.5" />
      <rect {...stroke} x="16.3" y="5.5" width="3.2" height="12.5" rx="1.5" />
    </svg>
  )
}

export function MoreIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="6" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="18" cy="12" r="1.6" fill="currentColor" />
    </svg>
  )
}

export function DirectoryIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        {...stroke}
        d="M4 9.2A3.2 3.2 0 0 1 7.2 6h2.4l1.4 1.8h6.8A3.2 3.2 0 0 1 21 11v5.8A3.2 3.2 0 0 1 17.8 20H7.2A3.2 3.2 0 0 1 4 16.8V9.2Z"
      />
    </svg>
  )
}

export function CreditIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect {...stroke} x="3.5" y="6.5" width="17" height="11" rx="3.2" />
      <path {...stroke} d="M3.5 10.5h17" />
      <path {...stroke} d="M8 14.5h4" />
    </svg>
  )
}

export function EditIcon({ size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        {...stroke}
        d="m14 6 4 4M5 19l1.2-4.6L15.8 4.8a2 2 0 0 1 2.9 2.8L9.1 17.2 5 19Z"
      />
    </svg>
  )
}

export function CopyIcon({ size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect {...stroke} x="8.5" y="8.5" width="10.5" height="10.5" rx="2.8" />
      <path
        {...stroke}
        d="M15.5 8.5V7A2.5 2.5 0 0 0 13 4.5H7A2.5 2.5 0 0 0 4.5 7v6A2.5 2.5 0 0 0 7 15.5h1.5"
      />
    </svg>
  )
}

export function TrashIcon({ size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="M5.5 8.5h13" />
      <path {...stroke} d="M10 11.5v5M14 11.5v5" />
      <path {...stroke} d="M9 8.5V7A2 2 0 0 1 11 5h2a2 2 0 0 1 2 2v1.5" />
      <path
        {...stroke}
        d="m7.5 8.5.8 10a2 2 0 0 0 2 1.8h3.4a2 2 0 0 0 2-1.8l.8-10"
      />
    </svg>
  )
}

export function CloseIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="M7 7 17 17M17 7 7 17" />
    </svg>
  )
}
