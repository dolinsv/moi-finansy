import { Navigate, Outlet } from 'react-router-dom'
import { APP_NAME, BrandMark } from './BrandMark'
import { useFinance } from '../FinanceContext'

export function RequireAuth() {
  const { currentUser, authReady } = useFinance()

  if (!authReady) {
    return (
      <div className="boot-screen">
        <div className="boot-card">
          <BrandMark />
          <p>Загрузка {APP_NAME}…</p>
        </div>
      </div>
    )
  }

  if (!currentUser) return <Navigate to="/login" replace />
  return <Outlet />
}
