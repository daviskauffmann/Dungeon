module.exports = {
  entry: './ts/main.ts',
  output: {
    filename: './js/main.js'
  },
  resolve: {
    extensions: ['.ts']
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  },
  devtool: 'source-map'
}
