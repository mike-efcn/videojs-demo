const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/**
 * @returns {webpack.Configuration}
 */
module.exports = () => ({
  devServer: {
    static: path.resolve(__dirname, './dist'),
    port: 2021,
  },
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.mjs'],
  },
  stats: {
    modules: false,
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|mjs)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.module\.less$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          'less-loader',
        ],
      },
      {
        test: /\.(css|less)$/,
        exclude: /\.module\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './public/index.html'),
    }),
    new MiniCssExtractPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
});
