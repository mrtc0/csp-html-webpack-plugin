const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CspHtmlWebpackPlugin } = require('../../');

module.exports = {
  webpack: {
    plugins: {
      add: [
        new CspHtmlWebpackPlugin(HtmlWebpackPlugin, {
          "base-uri": [`'self'`],
          "object-src": [`'none'`],
        })
      ]
    }
  }
}
