type BrandMarkProps = {
  size?: 'sm' | 'md'
  className?: string
}

export function BrandMark({ size = 'md', className = '' }: BrandMarkProps) {
  const dim = size === 'sm' ? 18 : 22
  return (
    <span className={`brand-mark ${size === 'sm' ? 'sm' : ''} ${className}`.trim()} aria-hidden>
      <WalletGlyph size={dim} />
    </span>
  )
}

function WalletGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M4.5 9.2h12.5A2.2 2.2 0 0 1 19.2 11.4v7A2.2 2.2 0 0 1 17 20.6H4.5A2.2 2.2 0 0 1 2.3 18.4v-7A2.2 2.2 0 0 1 4.5 9.2Z"
        fill="currentColor"
        fillOpacity="0.95"
      />
      <path
        d="M5 9.2V7.4c0-1 .7-1.8 1.6-2l8.2-1.5c1.2-.2 2.3.7 2.3 1.9v3.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="15.6" cy="15.2" r="2.1" fill="#574fe0" />
      <path
        d="M15.6 14.1v2.2M14.7 14.7h1.5"
        stroke="#fff"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  )
}

export const APP_NAME = 'Мои финансы'
