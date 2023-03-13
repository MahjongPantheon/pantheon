import path from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyPlugin from 'copy-webpack-plugin';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './app/index.ts',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(woff(2)?|ttf|eot|png|jpg)(\?v=\d+\.\d+\.\d+)?$/,
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
      template: 'app/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CopyPlugin({
      patterns: [
        { from: "app/assets", to: "assets" },
      ],
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
