const path = require('path');
const { DefinePlugin } = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
require('dotenv').config({
  path: path.resolve('..', 'Common', 'envs', process.env.ENV_FILENAME || 'default.env')
});
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

module.exports = {
  entry: './app/index.tsx',
  mode,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|jpg)(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        oneOf: [
          {
            resourceQuery: /svgr/,
            use: [
              {
                loader: "@svgr/webpack",
                options: {
                  svgoConfig: {
                    plugins: [
                      {
                        name: 'removeViewBox',
                        active: false
                      }
                    ]
                  }
                }
              }
            ],
            type: "javascript/auto",
          },
          {
            type: 'asset/resource',
          }
        ]
      }
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'app/index.html',
      SIGRUN_URL: process.env.SIGRUN_URL,
      FORSETI_URL: process.env.FORSETI_URL,
      MIMIR_URL: process.env.MIMIR_URL,
      FREY_URL: process.env.FREY_URL,
      TYR_URL: process.env.TYR_URL,
      COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
      STAT_HOST: process.env.STAT_HOST,
      ROOT_HOST: process.env.ROOT_HOST,
      STAT_SITE_ID: process.env.STAT_SITE_ID_FORSETI,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    }),
    new MiniCssExtractPlugin({
      filename: mode === 'production'
        ? '[name].[contenthash].css'
        : '[name].css',
    }),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(mode),
    })
  ],
  resolve: {
    alias: {
      '#': path.resolve(__dirname, 'app')
    },
    extensions: [ '.tsx', '.ts', '.js', '.jsx' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
