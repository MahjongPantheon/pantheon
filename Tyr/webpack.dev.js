 const { merge } = require('webpack-merge');
 const common = require('./webpack.common.js');

 module.exports = merge(common, {
   mode: 'development',
   devtool: 'source-map',
   devServer: {
     static: './dist',
     hot: false,
     liveReload: false,
     port: 4003,
     host: '0.0.0.0',
   },
 });

