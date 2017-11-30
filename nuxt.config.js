// Info about configuration https://nuxtjs.org/guide/configuration/
module.exports = {
  env: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000'
  },
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
  css: ['tachyons/css/tachyons.min.css', '~/assets/scss/main.scss'],
  build: {
    extractCSS: true,
    vendor: ['axios', 'gsap', 'vuex-class', 'nuxt-class-component']
  },
  modules: ['~/modules/typescript']
}
