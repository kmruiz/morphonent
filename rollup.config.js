import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'lib/index.js',
  output: {
    file: 'dist/index.js',
    format: 'esm'
  },
  plugins: [
    babel(),
    terser()
  ]
}