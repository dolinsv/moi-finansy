import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initVkBridge, isVkEnvironment } from './vk'

if (isVkEnvironment()) {
  document.documentElement.classList.add('vk-mini-app')
  void initVkBridge()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
