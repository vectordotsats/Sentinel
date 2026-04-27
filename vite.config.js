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
      },
    },
  }
})