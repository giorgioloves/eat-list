import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Avec design system
        parchment:  '#f5f0e8',
        linen:      '#ede5d8',
        terracotta: '#c4927a',
        stone:      '#c4b8a8',
        mist:       '#a08070',
        ghost:      '#b8a898',
        slate:      '#7090a8',
        espresso: {
          DEFAULT: '#3b2f27',
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
        sage: {
          DEFAULT: '#8a9e8a',
          400: '#9AAB8B',
          500: '#7A8A6B',
          600: '#65745A',
        },
        gold: {
          300: '#E4C97A',
          400: '#DEC070',
          500: '#D9B65D',
          600: '#C4A045',
        },
      },
      fontFamily: {
        sans:    ['var(--font-crimson)', 'Georgia', 'serif'],
        display: ['var(--font-crimson)', 'Georgia', 'serif'],
        mono:    ['var(--font-dm-mono)', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in':       'fadeIn 0.3s ease-in-out',
        'slide-up':      'slideUp 0.3s ease-out',
        'spin-slow':     'spin 2s linear infinite',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
