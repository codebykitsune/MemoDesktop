import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' },{ loader: 'postcss-loader' }],
});

rules.push({
  test: /\.(png|jpe?g|gif|svg)$/i,
  type: 'asset/resource', // Webpack 5 built-in asset handling
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
