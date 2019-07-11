import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  input: 'lib/index.js',
  output: [{
    file: 'dist/index.js',
    format: 'commonjs'
  }, {
    file: 'dist/browser.js',
    format: 'iife',
    name: 'morphonent'
  }],
  plugins: [
    babel(),
    nodeResolve(),
    commonjs(),
    terser()
  ]
}
