import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';
import html from "@open-wc/rollup-plugin-html";

const config = {
  input: './index.html',
  output: {
    dir: 'build',
    format: 'es',
    sourcemap: false
  },
  plugins: [
    copy({
      targets: [
        { src: 'index.html', dest: 'build/' },
        { src: 'assets/images/', dest: 'build/assets/' },
        { src: 'assets/fonts/', dest: 'build/assets/' },
        { src: 'dist/src/*.d.ts', dest: 'build/' },
        { src: 'dist/src/*.d.ts.map', dest: 'build/' }
      ]
    }),
    resolve(),
    terser(),
    html()
  ]
};

export default config;


