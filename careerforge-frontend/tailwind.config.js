/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#07070b',
        surface: '#0c0c15',
        card: '#10101a',
        card2: '#131320',
        primary: '#e8e8f0',
        muted: '#62627a',
        faint: '#3a3a50',
        brand: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ["'DM Sans'", '-apple-system', 'sans-serif'],
        mono: ["'DM Mono'", 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.28s ease both',
        'fade-in': 'fadeIn 0.2s ease both',
        'slide-right': 'slideInRight 0.22s ease',
        'blink': 'blink 1.1s ease infinite',
        'spin-slow': 'spin 0.75s linear infinite',
        'spin-reverse': 'spin 0.5s linear infinite reverse',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
      },
    },
  },
  plugins: [],
}
