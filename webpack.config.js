
const path = require('path');

module.exports = {
  mode: 'production',
  entry: [ "/src/photoviewer.js",'/src/modal.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'modal.bundle.js',
  },
};