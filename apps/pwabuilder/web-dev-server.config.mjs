// This is the configuration for `npm dev` and `npm start`.

export default {
  appIndex: "build/index.html",
  rootDir: "build/",
  compatibility: "none",
  watch: true,
  watchExcludes: "*.js.map", // ignore js map changes
  watchDebounce: 250,
  open: "/"
};