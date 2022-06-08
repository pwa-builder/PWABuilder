import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';

export default {
  input: [
      'build/pwa-auth.js'
    ],
  output: {
    dir: "dist",
    format: 'es',
    sourcemap: false
  },
  plugins: [
    resolve(),
    minifyHTML(),
    terser()
  ]
};