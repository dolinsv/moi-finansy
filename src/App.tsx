import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/RequireAuth'
import { FinanceProvider } from './FinanceContext'
import { CreditsPage } from './pages/CreditsPage'
import { DirectoriesPage } from './pages/DirectoriesPage'
import { ExpensesPage } from './pages/ExpensesPage'
import { HomePage } from './pages/HomePage'
import { IncomesPage } from './pages/IncomesPage'
import { LoginPage } from './pages/LoginPage'
import { ReportsPage } from './pages/ReportsPage'
import { ThemeProvider, useTheme } from './theme'

function AppRoutes() {
  const { setTheme } = useTheme()

  return (
    <FinanceProvider onVkTheme={setTheme}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="incomes" element={<IncomesPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="directories" element={<DirectoriesPage />} />
              <Route path="credits" element={<CreditsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </FinanceProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  )
}
