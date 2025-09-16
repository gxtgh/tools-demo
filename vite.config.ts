import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // 允许外部访问
    proxy: {
      '/api/bscscan': {
        target: 'https://api.bscscan.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bscscan/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        }
      }
    }
  },
})
