import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useFinance } from '../FinanceContext'
import { useTheme } from '../theme'
import { APP_NAME, BrandMark } from './BrandMark'
import {
  CreditIcon,
  DirectoryIcon,
  ExpenseIcon,
  HomeIcon,
  IncomeIcon,
  LogoutIcon,
  MoonIcon,
  MoreIcon,
  ReportIcon,
  SunIcon,
} from './Icons'

const links: {
  to: string
  label: string
  end?: boolean
  icon: ReactNode
}[] = [
  { to: '/', label: 'Главная', end: true, icon: <HomeIcon size={20} /> },
  { to: '/incomes', label: 'Приходы', icon: <IncomeIcon size={20} /> },
  { to: '/expenses', label: 'Расходы', icon: <ExpenseIcon size={20} /> },
  { to: '/directories', label: 'Справочники', icon: <DirectoryIcon size={20} /> },
  { to: '/credits', label: 'Кредиты и вклады', icon: <CreditIcon size={20} /> },
  { to: '/reports', label: 'Отчёты', icon: <ReportIcon size={20} /> },
]

const bottomLinks = [
  { to: '/', label: 'Главная', end: true, icon: <HomeIcon /> },
  { to: '/incomes', label: 'Приходы', icon: <IncomeIcon /> },
  { to: '/expenses', label: 'Расходы', icon: <ExpenseIcon /> },
  { to: '/reports', label: 'Отчёты', icon: <ReportIcon /> },
]

export function Layout() {
  const { currentUser, logout, isVkMiniApp, vkUser, cloud } = useFinance()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 960px)')
    const onChange = () => {
      if (!mq.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 960px)').matches
    document.body.style.overflow = menuOpen && mobile ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  const userLabel = currentUser?.name ?? 'Пользователь'
  const userSub = isVkMiniApp
    ? vkUser
      ? `VK ID ${vkUser.id}`
      : 'ВКонтакте'
    : `@${currentUser?.login}`

  return (
    <div className={`app-shell ${menuOpen ? 'menu-open' : ''}`}>
      <header className="topbar">
        <button
          type="button"
          className="icon-btn menu-toggle"
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="topbar-brand">
          <BrandMark size="sm" />
          <strong>{APP_NAME}</strong>
        </div>
        <div className="topbar-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          {!isVkMiniApp ? (
            <button
              type="button"
              className="icon-btn"
              onClick={onLogout}
              aria-label="Выйти"
              title="Выйти"
            >
              <LogoutIcon />
            </button>
          ) : null}
        </div>
      </header>

      <button
        type="button"
        className="nav-backdrop"
        onClick={() => setMenuOpen(false)}
        aria-label="Закрыть меню"
        tabIndex={menuOpen ? 0 : -1}
      />

      <aside className="sidebar">
        <div className="brand">
          <BrandMark />
          <div>
            <p className="brand-name">{APP_NAME}</p>
            <p className="brand-sub">семейный учёт</p>
          </div>
        </div>

        <nav className="nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              <span className="nav-icon">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-box">
            <strong>{userLabel}</strong>
            <span>{userSub}</span>
            <span className="cloud-pill" title={cloud.label}>
              {cloud.configured ? '☁ Облако' : 'Локально'}
            </span>
          </div>
          <div className="sidebar-tools">
            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
              title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            {!isVkMiniApp ? (
              <button
                type="button"
                className="icon-btn"
                onClick={onLogout}
                aria-label="Выйти"
                title="Выйти"
              >
                <LogoutIcon />
              </button>
            ) : null}
          </div>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Основная навигация">
        {bottomLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              isActive ? 'bottom-link active' : 'bottom-link'
            }
          >
            <span className="bottom-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className={menuOpen ? 'bottom-link active' : 'bottom-link'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="bottom-icon">
            <MoreIcon />
          </span>
          <span>Ещё</span>
        </button>
      </nav>
    </div>
  )
}
