import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import html from "@open-wc/rollup-plugin-html";
import replace from "@rollup/plugin-replace";
import strip from "@rollup/plugin-strip";
import copy from "rollup-plugin-copy";
import typescript from "@rollup/plugin-typescript";

const workbox = require('rollup-plugin-workbox-inject');

export default {
  input: "build/index.html",
  output: {
    dir: "dist",
    format: "es",
  },
  plugins: [
    resolve(),
    replace({
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "production"
      ),
    }),
    html(),
    typescript({
      tsconfig: "tsconfig.json"
    }),
    terser(),
    strip({
      functions: ["console.log"],
    }),
    copy({
      targets: [
        { src: "assets/**/*", dest: "dist/assets/" },
        { src: "styles/global.css", dest: "dist/styles/" },
        { src: "manifest.json", dest: "dist/" },
      ],
    }),
    workbox({
      globDirectory: "dist/",
      globPatterns: [
        "styles/*.css",
        "**/*/*.svg",
        "*.js",
        "*.html",
        "assets/**",
        "*.json",
      ],
    }),
  ],
};
