const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './app/index.tsx',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: ['file-loader?name=public/fonts/[name].[ext]']
      }
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'app/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
  resolve: {
    alias: {
      '#': path.resolve(__dirname, 'app'),
      '#config': getConfig()
    },
    extensions: [ '.tsx', '.ts', '.js', '.jsx' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

function getConfig() {
  switch (process.env.NODE_ENV) {
    case 'production':
      return path.resolve(__dirname, 'app/envConfig/environment.prod.ts');
    case 'development':
      if (process.env.IS_DOCKER) {
        return path.resolve(__dirname, 'app/envConfig/environment.docker.ts');
      }
    default: // explicit fallthrough
      return path.resolve(__dirname, 'app/envConfig/environment.local.ts');
  }
}
