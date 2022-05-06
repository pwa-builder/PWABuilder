
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import strip from '@rollup/plugin-strip';

export default {
  input: ['build/pwa-update.js'],
  output: {
    file: 'dist/pwa-update.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    resolve(),
    minifyHTML(),
    terser(),
    strip({
      functions: ['console.log']
    })
  ]
};
