export default {
  plugins: {
    '@tailwindcss/postcss': {
      content: ['./index.html', './src/**/*.{ts,tsx}'],
    },
    autoprefixer: {},
  },
}
