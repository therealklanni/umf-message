const path = require('path')
const maxSize = 500000

module.exports = {
  entry: './index.ts',
  mode: 'production',
  target: 'node',
  performance: {
    maxAssetSize: maxSize,
    maxEntrypointSize: maxSize
  },
  module: {
    rules: [
      {
        test: /\.ts$/u,
        use: 'ts-loader',
        exclude: [/node_modules/u, /__tests__/u]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2'
  }
}
