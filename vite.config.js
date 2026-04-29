import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/jup-price': {
          target: 'https://api.jup.ag',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/jup-price/, '/price/v3'),
          headers: {
            'x-api-key': env.VITE_JUPITER_API_KEY,
          },
        },
        '/api/jup-tokens': {
          target: 'https://api.jup.ag',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/jup-tokens/, '/tokens/v2'),
          headers: {
            'x-api-key': env.VITE_JUPITER_API_KEY,
          },
        },
        '/api/jup-swap': {
          target: 'https://api.jup.ag',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/jup-swap/, '/swap/v2'),
          headers: {
            'x-api-key': env.VITE_JUPITER_API_KEY,
          },
        },
        '/api/jup-trigger': {
          target: 'https://api.jup.ag',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/jup-trigger/, '/trigger/v2'),
          headers: {
            'x-api-key': env.VITE_JUPITER_API_KEY,
          },
        },
        '/api/jup-recurring': {
          target: 'https://api.jup.ag',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/jup-recurring/, '/recurring/v1'),
          headers: {
            'x-api-key': env.VITE_JUPITER_API_KEY,
          },
        },
        '/api/jup-prediction': {
          target: 'https://api.jup.ag',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/jup-prediction/, '/prediction/v1'),
          headers: {
            'x-api-key': env.VITE_JUPITER_API_KEY,
          },
        },
      },
    },
  }
})