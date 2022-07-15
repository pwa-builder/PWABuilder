import resolve from "@rollup/plugin-node-resolve";
import html from "@open-wc/rollup-plugin-html";
import copy from "rollup-plugin-copy";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import litcss from "rollup-plugin-lit-css";
import json from '@rollup/plugin-json';

export default {
  input: "index.html",
  output: {
    dir: "build",
    format: "es",
    sourcemap: true
  },
  plugins: [
    resolve(),
    html(),
    json(),
    typescript({
      tsconfig: "tsconfig.dev.json",
      resolveJsonModule: true
    }),
    litcss(),
    replace({
      "window.ENV": JSON.stringify(process.env.NODE_ENV || "development"),
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
      preventAssignment: true,
    }),
    copy({
      targets: [
        { src: "assets/**/*", dest: "build/assets/" },
        { src: "styles/global.css", dest: "build/styles/" },
        { src: "manifest.json", dest: "build/" },
        { src: "workers/**/*", dest: "build/workers/" },
        { src: "fast-components.min.js", dest: "build/" }
      ],
      copyOnce: true
    }),
  ],
};
