module.exports = () => ({
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: '8.10',
      },
      modules: false,
      useBuiltIns: 'usage',
      loose: true,
    }],
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-class-properties',
  ],
});
