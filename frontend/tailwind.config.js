/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#22C55E',
        secondary: '#2563EB',
        background: '#F9FAFB',
        text: '#111827',
        'dark-green': '#15803D',
      },
    },
  },
  plugins: [],
}