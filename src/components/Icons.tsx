type IconProps = { size?: number }

const stroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function LogoutIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="M9 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2" />
      <path {...stroke} d="m15 8 4 4-4 4M10 12h9" />
    </svg>
  )
}

export function SunIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle {...stroke} cx="12" cy="12" r="3.75" />
      <path
        {...stroke}
        d="M12 3v1.6M12 19.4V21M4.6 12H3M21 12h-1.6M6.2 6.2l1.1 1.1M16.7 16.7l1.1 1.1M17.8 6.2l-1.1 1.1M7.3 16.7l-1.1 1.1"
      />
    </svg>
  )
}

export function MoonIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="M19.5 13.2A7 7 0 1 1 10.8 4.5 5.8 5.8 0 0 0 19.5 13.2Z" />
    </svg>
  )
}

export function HomeIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="m4.5 11 7.5-6.5L19.5 11" />
      <path {...stroke} d="M7 10.5V19a1 1 0 0 0 1 1h3.2v-5.2h1.6V20H16a1 1 0 0 0 1-1v-8.5" />
    </svg>
  )
}

export function IncomeIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="M12 17V5M8.5 8.5 12 5l3.5 3.5" />
      <path {...stroke} d="M6 19h12" />
    </svg>
  )
}

export function ExpenseIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="M12 7v12M8.5 15.5 12 19l3.5-3.5" />
      <path {...stroke} d="M6 5h12" />
    </svg>
  )
}

export function ReportIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="M6 18V11M11 18V7M16 18v-5M21 18V9" />
      <path {...stroke} d="M3 18h18" />
    </svg>
  )
}

export function MoreIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="6" cy="12" r="1.35" fill="currentColor" />
      <circle cx="12" cy="12" r="1.35" fill="currentColor" />
      <circle cx="18" cy="12" r="1.35" fill="currentColor" />
    </svg>
  )
}

export function DirectoryIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        {...stroke}
        d="M4 8.2A2.2 2.2 0 0 1 6.2 6h3.1l1.5 1.7h7A2.2 2.2 0 0 1 20 9.9v6.9A2.2 2.2 0 0 1 17.8 19H6.2A2.2 2.2 0 0 1 4 16.8V8.2Z"
      />
    </svg>
  )
}

export function CreditIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect {...stroke} x="3.5" y="6.5" width="17" height="11" rx="2.2" />
      <path {...stroke} d="M3.5 10.5h17" />
      <path {...stroke} d="M7.5 14.5h3.5" />
    </svg>
  )
}

export function EditIcon({ size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        {...stroke}
        d="m14.2 5.8 4 4M4.5 19.5l1.3-5.1L16.5 3.7a2.1 2.1 0 0 1 3 3L8.7 17.5l-4.2 1Z"
      />
    </svg>
  )
}

export function CopyIcon({ size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect {...stroke} x="8.5" y="8.5" width="11" height="11" rx="2" />
      <path {...stroke} d="M15.5 8.5V6.8A2.3 2.3 0 0 0 13.2 4.5H6.8A2.3 2.3 0 0 0 4.5 6.8v6.4A2.3 2.3 0 0 0 6.8 15.5H8.5" />
    </svg>
  )
}

export function TrashIcon({ size = 17 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="M5 8h14M10 11v6M14 11v6" />
      <path {...stroke} d="M8.5 8V6.4A1.4 1.4 0 0 1 9.9 5h4.2a1.4 1.4 0 0 1 1.4 1.4V8" />
      <path {...stroke} d="m7 8 1 11.2A1.5 1.5 0 0 0 9.5 20.5h5a1.5 1.5 0 0 0 1.5-1.3L17 8" />
    </svg>
  )
}

export function CloseIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />
    </svg>
  )
}
