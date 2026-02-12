module.exports = {
  plugins: {
    '@tailwindcss/postcss': {
      content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
    },
    autoprefixer: {},
  },
}
