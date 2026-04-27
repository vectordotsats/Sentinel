import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/jup-price': {
        target: 'https://api.jup.ag',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jup-price/, '/price/v2'),
      },
      '/api/jup-tokens': {
        target: 'https://api.jup.ag',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jup-tokens/, '/tokens/v1'),
      },
    },
  },
})