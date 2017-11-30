<template>
  <div>
    <!-- Old header -->
    <header class="pwa-header pure-g">
      <div class="pwa-header-left pure-u pure-u-md-1-5">
        <nuxt-link to="/">
          <img class="pwa-header-logo" src="assets/images/logo-4fb7f2c9c42c310ace5c2fcb62412082.png" alt="PWA Builder logo">
        </nuxt-link>
      </div>
    
      <nav class="pwa-header-right pure-u pure-u-md-4-5">
        <ul class="pwa-header-menu">
          <li class="pwa-header-item">
            <nuxt-link to="generator" class="pwa-header-link" active-class="active">PWA Builder</nuxt-link>
          </li>
          <li class="pwa-header-item">
            <a class="pwa-header-link" href="//docs.pwabuilder.com/" target="_blank">Documentation</a>
          </li>
          <li class="pwa-header-item">
            <a class="pwa-header-link" href="//appimagegenerator-prod.azurewebsites.net">PWA Image Generator</a>
          </li>
          <li class="pwa-header-item">
            <a class="pwa-header-link" href="//github.com/pwa-builder" target="_blank">Github</a>
          </li>
        </ul>
      </nav>
    </header>

    <div class="container">
      <nuxt/>
    </div>
  </div>
</template>
