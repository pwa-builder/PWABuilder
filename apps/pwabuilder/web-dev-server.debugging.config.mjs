// This is the configuration file for `npm debug`
// This is the same as web-server.config.mjs, except that it doesn't launch a browser, see the `open: false`
// The browser will instead be launched by VSCode F5 debugging in a separate user profile.

export default {
    appIndex: "build/index.html",
    rootDir: "build/",
    compatibility: "none",
    watch: true,
    open: false
  };