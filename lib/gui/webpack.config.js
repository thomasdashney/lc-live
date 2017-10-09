const HtmlWebpackPlugin = require('html-webpack-plugin')
const { resolve } = require('path')

const src = resolve(__dirname)

module.exports = {
  entry: [
    resolve(src, 'index')
  ],
  output: {
    path: '/'
  },
  context: src,
  devtool: 'eval',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              'react',
              ['env', {
                'targets': {
                  'chrome': 58 // current electron version
                }
              }]
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, 'index.html')
    })
  ]
}
