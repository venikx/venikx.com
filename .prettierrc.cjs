module.exports = {
  arrowParens: 'always',
  tabWidth: 2,
  singleQuote: true,
  semi: false,
  trailingComma: 'es5',
  plugins: [require.resolve('prettier-plugin-astro')],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
}
