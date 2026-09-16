import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages: https://dolinsv.github.io/moi-finansy/
const base = process.env.GITHUB_PAGES === '1' ? '/moi-finansy/' : './'

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    host: '0.0.0.0',
    port: 5175,
  },
  build: {
    outDir: 'dist',
  },
})
