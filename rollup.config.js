import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import html from "@open-wc/rollup-plugin-html";
import replace from "@rollup/plugin-replace";
import strip from "@rollup/plugin-strip";
import copy from "rollup-plugin-copy";
import typescript from "@rollup/plugin-typescript";
import litcss from "rollup-plugin-lit-css";
import json from '@rollup/plugin-json';

export default {
  input: "build/index.html",
  output: {
    dir: "dist",
    format: "es"
  },
  plugins: [
    resolve(),
    replace({
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "production"
      ),
    }),
    html(),
    json(),
    typescript({
      tsconfig: "tsconfig.json",
      resolveJsonModule: true
    }),
    litcss(),
    terser(),
    strip({
      functions: ["console.log"],
    }),
    copy({
      targets: [
        { src: "assets/**/*", dest: "dist/assets/" },
        { src: "styles/global.css", dest: "dist/styles/" },
        { src: "manifest.json", dest: "dist/" },
        { src: "workers/**/*", dest: "dist/workers/" },
        { src: "routes.json", dest: "dist/" },
      ],
    })
  ],
};
