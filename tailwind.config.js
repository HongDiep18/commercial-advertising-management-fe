/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'header-red-dark': '#a20519',
        'header-red-light': '#d10a22',
        'body-bg-dark': '#f5f1ea',
        'body-bg-light': '#faf8f5',
        'body-bg-dark-foreground': '#e7e4dd',
        primary: '#a20519',
        'primary-foreground': '#ffffff',
        background: '#f8fafc',
        card: '#ffffff',
        border: '#e5e7eb',
        secondary: '#f3f4f6',
        'muted-foreground': '#6b7280',
        foreground: '#111827',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(2, 6, 23, 0.08)',
        'footer-red': '#901018',
      },
    },
  },
  plugins: [],
}

