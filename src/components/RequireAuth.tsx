import { Navigate, Outlet } from 'react-router-dom'
import { APP_NAME, BrandMark } from './BrandMark'
import { useFinance } from '../FinanceContext'

export function RequireAuth() {
  const { currentUser, authReady, isVkMiniApp } = useFinance()

  if (!authReady) {
    return (
      <div className="boot-screen">
        <div className="boot-card">
          <BrandMark />
          <p>{isVkMiniApp ? `Открываем ${APP_NAME}…` : 'Загрузка…'}</p>
        </div>
      </div>
    )
  }

  if (!currentUser) return <Navigate to="/login" replace />
  return <Outlet />
}
