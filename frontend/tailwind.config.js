/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3d7eff',
        primaryHover: '#2968eb',
        charcoal: '#2f2f34',
        surface: '#f8f9fa',
        card: '#ffffff',
        cardHover: '#f1f3f5',
        borderMuted: '#e2e4e8',
        borderBright: '#d4d4d4',
        mutedText: '#8b9098',
        critical: '#ef4444',
        warning: '#f59e0b',
        safe: '#10b981'
      }
    },
  },
  plugins: [],
}
