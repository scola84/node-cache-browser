import buble from 'rollup-plugin-buble';

export default {
  dest: './dist/cache-browser.js',
  entry: 'index.js',
  format: 'cjs',
  plugins: [
    buble()
  ]
};
