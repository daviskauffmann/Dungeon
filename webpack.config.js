module.exports = {
  entry: './src/ts/main.ts',
  output: {
    filename: 'main.js'
  },
  resolve: {
    extensions: ['.ts']
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  },
  devtool: 'source-map'
}
