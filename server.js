
// Custom server from official example https://github.com/nuxt/nuxt.js/blob/dev/examples/custom-server/server.js
// We need this because we are on Azure, if is not your case or similar you can 
// add to your package.json the script: "start": "cross-env NODE_ENV=production nuxt start"

const app = require('express')()
const { Nuxt, Builder } = require('nuxt')

const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

// Import and set Nuxt.js options
let config = require('./nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

const nuxt = new Nuxt(config)

// Start build process in dev mode
if (config.dev) {
  const builder = new Builder(nuxt)
  builder.build()
}

// Give nuxt middleware to express
app.use(nuxt.render)

// Start express server
app.listen(port, host)