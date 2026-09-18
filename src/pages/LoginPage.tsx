import { type FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { APP_NAME, BrandMark } from '../components/BrandMark'
import { MoonIcon, SunIcon } from '../components/Icons'
import { useFinance } from '../FinanceContext'
import { useTheme } from '../theme'

export function LoginPage() {
  const { currentUser, login, authReady, cloud } = useFinance()
  const { theme, toggleTheme } = useTheme()
  const [loginName, setLoginName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!authReady) {
    return (
      <div className="boot-screen">
        <div className="boot-card">
          <BrandMark />
          <p>Загрузка…</p>
        </div>
      </div>
    )
  }

  if (currentUser) return <Navigate to="/" replace />

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const result = login(loginName, password)
    if (result) setError(result)
    else setError('')
  }

  return (
    <div className="login-screen">
      <button
        type="button"
        className="icon-btn login-theme"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
      <form className="login-card" onSubmit={onSubmit}>
        <div className="login-brand">
          <BrandMark />
          <div>
            <h1>{APP_NAME}</h1>
          </div>
        </div>

        <label className="field">
          <span>Логин</span>
          <input
            type="text"
            autoComplete="username"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            required
            autoFocus
          />
        </label>
        <label className="field">
          <span>Пароль</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error ? <p className="login-error">{error}</p> : null}

        <button type="submit" className="btn primary full">
          Войти
        </button>

        <p className="login-hint">{cloud.label}</p>
      </form>
    </div>
  )
}
