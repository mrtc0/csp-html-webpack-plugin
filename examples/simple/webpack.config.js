const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CspHtmlWebpackPlugin } = require('../../');

module.exports = {
    entry: './src/index.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js'
    },
    plugins: [
      new HtmlWebpackPlugin(
        Object.assign({}, {inject: true, template: './public/index.html'})
      ),
        new CspHtmlWebpackPlugin(HtmlWebpackPlugin)
    ]
};
