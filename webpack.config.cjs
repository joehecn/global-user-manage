const path = require('path');
const nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: 'production',
  target: 'node',
  externals: [nodeExternals()],
  entry: './index.js',
  output: {
    libraryTarget: 'commonjs',
    filename: 'main.cjs',
    path: path.resolve(__dirname, 'dist'),
  }
};
