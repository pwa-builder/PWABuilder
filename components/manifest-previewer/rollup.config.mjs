import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import replace from "@rollup/plugin-replace";
import strip from "@rollup/plugin-strip";
import copy from "rollup-plugin-copy";
import litcss from "rollup-plugin-lit-css";

export default {
  input: ["build/manifest-previewer.js"],
  output: {
    file: "dist/manifest-previewer.js",
    format: "es",
    sourcemap: false,
  },
  plugins: [
    resolve(),
    replace({
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "production"
      ),
      '../assets': 'https://raw.githubusercontent.com/pwa-builder/pwabuilder/main/components/manifest-previewer/assets',
      delimiters: ['', '']
    }),
    litcss(),
    terser(),
    strip({
      functions: ["console.log"],
    }),
    copy({
      targets: [
        { src: 'build/*.d.ts', dest: 'dist/' },
        { src: 'build/*.d.ts.map', dest: 'dist/' }
      ]
    })
  ]
};
