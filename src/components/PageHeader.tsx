import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-text">
        <div className="page-header-top">
          <h1>{title}</h1>
          {action ? <div className="page-header-action">{action}</div> : null}
        </div>
        {subtitle ? <p className="page-sub">{subtitle}</p> : null}
      </div>
    </header>
  )
}
