// Info about configuration https://nuxtjs.org/guide/configuration/
var sassLintPlugin = require('sasslint-webpack-plugin');
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

console.log(`Environment: ${process.env.NODE_ENV}`);

module.exports = {
  env: require(`./environments/${process.env.NODE_ENV}`),
  head: {
    title: 'PWABuilder',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'All the tools you need to build and deploy your Progressive Web Apps.' }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  loading: { color: '#1FC2C8' },
  css: ['tachyons/css/tachyons.min.css', 'prismjs/themes/prism-okaidia.css', '~/assets/scss/app.scss'],
  build: {
    extractCSS: true,
    vendor: ['babel-polyfill', 'gsap', 'vuex-class', 'nuxt-class-component', 'vue-i18n', 'prismjs'],
    plugins:[
      new sassLintPlugin({
        glob: '?(assets|components|layouts|pages)/**/*.s?(a|c)ss',
        failOnWarning: false,
        failOnError: false
      }),
      // new ForkTsCheckerWebpackPlugin({
      //   tslint: true,
      //   vue: true
      // })
    ]
  },
  router: {
    middleware: 'i18n'
  },
  plugins: ['~/plugins/i18n.js'],
  modules: [
    '~/modules/typescript',
    '@nuxtjs/axios'
  ]
}
