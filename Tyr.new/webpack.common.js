const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'app/index.html'
    })
  ],
  resolve: {
    alias: {
      '#': path.resolve(__dirname, 'app'),
      '#config': getConfig()
    },
    extensions: [ '.tsx', '.ts', '.js', '.jsx' ],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        parse: {
          ecma: 8
        },
        compress: {
          ecma: 5,
          warnings: false,
          comparisons: false,
          inline: 2
        },
        mangle: {
          safari10: true
        },
        output: {
          ecma: 5,
          comments: false,
          ascii_only: true
        }
      },
      cache: true,
      parallel: true,
      sourceMap: true
    })],
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
