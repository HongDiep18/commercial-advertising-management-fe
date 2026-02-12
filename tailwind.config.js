/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'header-red-dark': 'var(--color-header-red-dark)',
        'header-red-light': 'var(--color-header-red-light)',
        'body-bg-dark': 'var(--color-body-bg-dark)',
        'body-bg-light': 'var(--color-body-bg-light)',
        'body-bg-dark-foreground': 'var(--color-body-bg-dark-foreground)',
        primary: 'var(--color-primary)',
        'primary-foreground': 'var(--color-primary-foreground)',
        background: 'var(--color-background)',
        card: 'var(--color-card)',
        border: 'var(--color-border)',
        secondary: 'var(--color-secondary)',
        'muted-foreground': 'var(--color-muted-foreground)',
        foreground: 'var(--color-foreground)',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(2, 6, 23, 0.08)',
        'footer-red': '#901018',
      },
    },
  },
  plugins: [],
}

