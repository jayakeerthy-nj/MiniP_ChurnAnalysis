/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        app: '#0a0c10',
        sidebar: '#0f1217',
        card: '#141820',
        cardHover: '#181d26',
        subtle: '#1c222c',
        borderMuted: '#1d232c',
        borderBright: '#27303d',
        cyanMain: '#00b4d8',
        cyanBright: '#00d2ff',
        blueAccent: '#0077b6',
        critical: '#ef4444',
        warning: '#f59e0b',
        safe: '#10b981'
      }
    },
  },
  plugins: [],
}