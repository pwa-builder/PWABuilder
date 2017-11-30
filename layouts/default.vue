<template>
  <div>
    <header class="pwa-header pure-g">
      <div class="pwa-header-left pure-u pure-u-md-1-5">
        <nuxt-link to="/">
          <img class="pwa-header-logo" src="~/assets/images/logo.png" alt="PWA Builder logo">
        </nuxt-link>
      </div>
    
      <nav class="pwa-header-right pure-u pure-u-md-4-5">
        <ul class="pwa-header-menu">
          <li class="pwa-header-item">
            <nuxt-link to="/" class="pwa-header-link" active-class="active">PWA Builder</nuxt-link>
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

    <footer class="pwa-footer pure-g is-small">
      <div class="pure-u-1-2 pure-u-md-1-5">
        <a id="ember388" class="ember-view pwa-footer-action pwa-footer-action--block active" href="/generator">Generate</a>
        <a class="pwa-footer-action pwa-footer-action--block" href="http://docs.pwabuilder.com/" target="_blank">Documentation</a>
      </div>
      <div class="pure-u-1-2 pure-u-md-1-5">
        <a class="pwa-footer-action pwa-footer-action--block" href="//appimagegenerator-prod.azurewebsites.net">PWA Image Generator</a>
        <a class="pwa-footer-action pwa-footer-action--block" href="https://github.com/pwa-builder" target="_blank">Github</a>
      </div>
      <div class="pwa-footer-social pure-u-1 pure-u-md-3-5">
        <a class="pwa-footer-logo_action" href="https://twitter.com/boyofgreen" target="_blank">
          <img class="pwa-footer-logo" src="~/assets/images/logo_twitter.svg">
        </a>
        <a class="pwa-footer-logo_action" href="https://github.com/pwa-builder" target="_blank">
          <img class="pwa-footer-logo" src="~/assets/images/logo_github.svg">
        </a>
        <a class="pwa-footer-logo_action" href="https://www.npmjs.com/package/manifoldjs" target="_blank">
          <img class="pwa-footer-logo pwa-footer-logo--big" src="~/assets/images/logo_npm.svg">
        </a>
        <a class="pwa-footer-logo_action" href="http://stackoverflow.com/questions/tagged/manifoldjs" target="_blank">
          <img class="pwa-footer-logo pwa-footer-logo--small" src="~/assets/images/logo_stackoverflow.svg">
        </a>
      </div>
      <div class="pure-u-1 pwa-footer-copy">
        PWABuilder was founded by Microsoft as a community guided, open source project to help move PWA adoption forward. <span class="divider">|</span> <a href="https://github.com/pwa-builder/ManifoldJS#license" target="_blank" class="pwa-footer-action">License</a>
      </div>
    </footer>
  </div>
</template>
