module.exports = {
  entry: './src/ts/main.ts',
  output: {
    filename: './www/js/main.js'
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
