// Info about configuration https://nuxtjs.org/guide/configuration/
module.exports = {
  env: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000'
  },
  head: {
    title: 'starter',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxt.js project' }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  loading: { color: '#3B8070' },
  css: ['tachyons/css/tachyons.min.css', '~/assets/scss/main.scss'],
  build: {
    vendor: ['axios', 'gsap', 'vuex-class', 'nuxt-class-component']
  },
  modules: ['~/modules/typescript']
}
