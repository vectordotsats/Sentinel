/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sentinel: {
          bg: '#0a0e1a',
          surface: '#111827',
          card: '#1a2035',
          border: '#1e2a45',
          accent: '#6366f1',
          accentHover: '#818cf8',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          muted: '#6b7280',
          text: '#e5e7eb',
          textBright: '#f9fafb',
          highlight: '#22d3ee',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
