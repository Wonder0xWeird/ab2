import type { Config } from 'tailwindcss';

// Constants from the previous portfolio
const SHADOW = "#141921";
const BG_COLOR = "#222831";

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        alice: ['Alice', 'Times New Roman', 'serif'],
        crimson: ['Crimson Text', 'Georgia', 'serif'],
      },
      colors: {
        // Custom color palette for ABSTRACTU
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Gold color palette from previous portfolio
        gold: {
          50: '#fff3e0',
          100: '#f1dfbe',
          200: '#e5ca98',
          300: '#d9b571',
          400: '#cea04a',
          500: '#b58731',
          600: '#8d6924',
          700: '#654b18',
          800: '#3d2d0a',
          900: '#180e00',
          DEFAULT: '#cc9c42',
        },
        // Grey color palette from previous portfolio
        grey: {
          50: '#edf2fc',
          100: '#d4d8e0',
          200: '#b9bec6',
          300: '#9ea4ae',
          400: '#838a96',
          500: '#68707c',
          600: '#515761',
          700: '#393e46',
          800: '#21252c',
          900: '#070c15',
        },
        // Background and shadow colors
        background: BG_COLOR,
        shadow: SHADOW,
        foreground: '#e0e0e0',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      boxShadow: {
        'tablet': `0 3px 10px 5px ${SHADOW}`,
      },
      backgroundImage: {
        'dark-exa': "url('https://www.transparenttextures.com/patterns/dark-exa.png')",
      },
      animation: {
        'fadeIn': 'fadeIn 0.4s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(50px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  darkMode: 'media',
};

export default config; 