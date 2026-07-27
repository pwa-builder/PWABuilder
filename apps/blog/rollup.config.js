import replace from "@rollup/plugin-replace"
import terser from "@rollup/plugin-terser"
import path from "path"
import postcss from "rollup-plugin-postcss"

const dev = process.env.NODE_ENV !== "production"

export default {
  input: "src/scripts/main.js",
  output: {
    sourcemap: false,
    format: "iife",
    name: "main",
    file: "dist/assets/main.bundle.js",
  },
  plugins: [
    replace({
      DEV_MODE: dev,
      preventAssignment: true,
    }),
    postcss({
      extract: path.resolve("dist/assets/main.bundle.css"),
      minimize: !dev,
    }),
    !dev && terser(),
  ],
  watch: {
    clearScreen: false,
  },
}
