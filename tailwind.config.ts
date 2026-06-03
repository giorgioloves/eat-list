import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#E4C97A',
          400: '#DEC070',
          500: '#D9B65D',
          600: '#C4A045',
        },
        espresso: {
          50:  '#F8F4ED',
          100: '#EAE3E0',
          200: '#D5CCC8',
          300: '#C0B5B0',
          400: '#A09590',
          500: '#7A6158',
          600: '#5C4E49',
          700: '#4A3E3A',
          800: '#352E2B',
          900: '#2B2623',
          950: '#1E1A18',
        },
        merlot: {
          400: '#C4687A',
          500: '#7D3A4A',
          600: '#6A2F3D',
        },
        sage: {
          400: '#9AAB8B',
          500: '#7A8A6B',
          600: '#65745A',
        },
        apricot: {
          400: '#EDB998',
          500: '#E8A87C',
          600: '#D4915E',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin-slow': 'spin 2s linear infinite',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
