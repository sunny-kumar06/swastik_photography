/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#07090e',
          navy: '#0b1120',
          card: '#111827',
          surface: '#182234',
          accent: '#e11d48',      // Luxury cinematic red accent
          accentHover: '#be123c',
          gold: '#f59e0b',        // Subtle golden highlights
          goldLight: '#fde68a',
          silver: '#e2e8f0',
          muted: '#94a3b8',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        cinematic: ['Cinzel', 'Trajan Pro', 'serif'],
      },
      boxShadow: {
        'glow-red': '0 0 25px -5px rgba(225, 29, 72, 0.35)',
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
