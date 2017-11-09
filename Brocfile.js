/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var isDev = EmberApp.env() === 'development';
var app = new EmberApp({
  emberCliFontAwesome: { includeFontAwesomeAssets: false },
  autoprefixer: {
    browsers: ['last 2 ios version']
  },
  minifyCSS: { enabled: !isDev },
  minifyJS:  { enabled: !isDev },
  sourcemaps: {
    enabled: isDev
  }
});

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

app.import('bower_components/prism/themes/prism-okaidia.css');
app.import('bower_components/clipboard/dist/clipboard.js');
app.import('bower_components/prism/prism.js');
app.import('bower_components/prism/plugins/toolbar/prism-toolbar.css');
app.import('bower_components/prism/plugins/toolbar/prism-toolbar.js');
app.import('bower_components/custom-copy-to-clipboard/prism-copy-to-clipboard.js');
app.import('bower_components/pluralize/pluralize.js');
app.import('bower_components/lodash/dist/lodash.min.js');
app.import('bower_components/flare/dist/flare.min.js');

app.import("bower_components/font-awesome/css/font-awesome.css");
app.import("bower_components/font-awesome/fonts/fontawesome-webfont.eot", { destDir: "fonts" });
app.import("bower_components/font-awesome/fonts/fontawesome-webfont.svg", { destDir: "fonts" });
app.import("bower_components/font-awesome/fonts/fontawesome-webfont.ttf", { destDir: "fonts" });
app.import("bower_components/font-awesome/fonts/fontawesome-webfont.woff", { destDir: "fonts" });
app.import("bower_components/font-awesome/fonts/fontawesome-webfont.woff2", { destDir: "fonts" });
app.import("bower_components/font-awesome/fonts/FontAwesome.otf", { destDir: "fonts" });

module.exports = app.toTree();
