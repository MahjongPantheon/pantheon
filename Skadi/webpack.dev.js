import { merge } from 'webpack-merge';
import common from './webpack.common.js';

export default merge(common, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    static: './dist',
    hot: false,
    liveReload: false,
    port: 4006,
    host: '0.0.0.0',
  },
});

