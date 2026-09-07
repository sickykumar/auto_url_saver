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
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#36a9f8',
          500: '#0c8de9',
          600: '#0270c7',
          700: '#0359a1',
          800: '#074c84',
          900: '#0c3f6e',
          950: '#082849',
        },
        dark: {
          bg: '#0b0f19',
          surface: '#111827',
          border: '#1f293d',
          hover: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-brand': '0 0 20px -3px rgba(12, 141, 233, 0.4)',
        'glow-success': '0 0 20px -3px rgba(34, 197, 94, 0.4)',
      }
    },
  },
  plugins: [],
}
