<script>
export default {
  middleware: 'default'
}
</script>

<template>
  <div>
    <header class="l-header pure-g">
      <div class="l-header-left pure-u pure-u-md-1-5">
        <nuxt-link to="/generator">
          <img class="l-header-logo" src="~/assets/images/logo.png" alt="PWA Builder logo">
        </nuxt-link>
      </div>
    
      <nav class="l-header-right pure-u pure-u-md-4-5">
        <ul class="l-header-menu">
          <li class="l-header-item">
            <nuxt-link :to="$i18n.path('')" exact class="l-header-link is-active">PWA Builder</nuxt-link>
          </li>
          <li class="l-header-item">
            <a class="l-header-link" href="//docs.pwabuilder.com/" target="_blank">Documentation</a>
          </li>
          <li class="l-header-item">
            <a class="l-header-link" href="//appimagegenerator-prod.azurewebsites.net">PWA Image Generator</a>
          </li>
          <li class="l-header-item">
            <a class="l-header-link" href="//github.com/pwa-builder" target="_blank">Github</a>
          </li>
        </ul>
      </nav>
    </header>

    <div class="container">
      <nuxt/>
    </div>

    <footer class="l-footer pure-g is-small">
      <div class="pure-u-1-2 pure-u-md-1-5">
        <a class="l-footer-action l-footer-action--block active" href="/generator">Generate</a>
        <a class="l-footer-action l-footer-action--block" href="http://docs.pwabuilder.com/" target="_blank">Documentation</a>
      </div>
      <div class="pure-u-1-2 pure-u-md-1-5">
        <a class="l-footer-action l-footer-action--block" href="//appimagegenerator-prod.azurewebsites.net">PWA Image Generator</a>
        <a class="l-footer-action l-footer-action--block" href="https://github.com/pwa-builder" target="_blank">Github</a>
      </div>
      <div class="l-footer-social pure-u-1 pure-u-md-3-5">
        <a class="l-footer-logo_action" href="https://twitter.com/boyofgreen" target="_blank">
          <img class="l-footer-logo" src="~/assets/images/logo_twitter.svg">
        </a>
        <a class="l-footer-logo_action" href="https://github.com/pwa-builder" target="_blank">
          <img class="l-footer-logo" src="~/assets/images/logo_github.svg">
        </a>
        <a class="l-footer-logo_action" href="https://www.npmjs.com/package/manifoldjs" target="_blank">
          <img class="l-footer-logo l-footer-logo--big" src="~/assets/images/logo_npm.svg">
        </a>
        <a class="l-footer-logo_action" href="http://stackoverflow.com/questions/tagged/manifoldjs" target="_blank">
          <img class="l-footer-logo l-footer-logo--small" src="~/assets/images/logo_stackoverflow.svg">
        </a>
      </div>
      <div class="pure-u-1 l-footer-copy">
        PWABuilder was founded by Microsoft as a community guided, open source project to help move PWA adoption forward. <span class="divider">|</span> <a href="https://github.com/pwa-builder/ManifoldJS#license" target="_blank" class="l-footer-action">License</a>
      </div>
    </footer>
  </div>
</template>
