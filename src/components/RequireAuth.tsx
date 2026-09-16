import { Navigate, Outlet } from 'react-router-dom'
import { useFinance } from '../FinanceContext'

export function RequireAuth() {
  const { currentUser, authReady, isVkMiniApp } = useFinance()

  if (!authReady) {
    return (
      <div className="boot-screen">
        <div className="boot-card">
          <span className="brand-mark">МФ</span>
          <p>{isVkMiniApp ? 'Открываем МоиФинансы…' : 'Загрузка…'}</p>
        </div>
      </div>
    )
  }

  if (!currentUser) return <Navigate to="/login" replace />
  return <Outlet />
}
