/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Only apply hover: styles on devices that can hover, so taps on a phone don't leave them stuck on.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        // SambaNova brand purple, sampled from sambanova.ai (nav, CTA accents, --df-accent)
        accent: {
          DEFAULT: '#7c3fa8',
          50: '#f6f1fb',
          100: '#ead9f5',
          200: '#d9b8ec',
          300: '#c08ee0',
          400: '#ac71d2',
          500: '#9859c8',
          600: '#7c3fa8',
          700: '#4e226b',
          800: '#35174a',
          900: '#250e36',
          950: '#16121f',
        },
        // SambaNova gold, used for CTAs/highlights on sambanova.ai
        gold: {
          DEFAULT: '#fdb913',
          50: '#fff8e6',
          100: '#ffedb3',
          400: '#fdc94d',
          500: '#fdb913',
          600: '#e2a30a',
        },
      },
    },
  },
  plugins: [],
}
