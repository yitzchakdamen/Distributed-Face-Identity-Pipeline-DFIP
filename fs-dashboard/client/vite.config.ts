import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  assetsInclude: ['**/*.svg'],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  preview: {
    allowedHosts: true
  },
  build: {
    assetsDir: 'assets',
    copyPublicDir: true
  },
  define: {
    __API_URL__: JSON.stringify(mode === 'production' ? 'https://api.facealert.live' : 'http://localhost:3000')
  }
}))
