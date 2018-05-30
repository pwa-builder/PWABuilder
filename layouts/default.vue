  <script lang="ts">
  export default {
    middleware: 'default',
    
    data() {
      return {
        pathnameUrl: this.$route.path,
      };
    },
    watch: {
      '$route': function() {
        this.pathnameUrl = this.$route.path;
      }
    }
  };
</script>

<template>
  <div>
    <header class="l-header pure-g">
      <div class="l-header-left pure-u pure-u-md-1-5">
        <nuxt-link to="/">
          <img class="l-header-logo" src="~/assets/images/logo.png" :alt="$t('menu.logo')">
        </nuxt-link>
      </div>
    
      <nav class="l-header-right pure-u pure-u-md-4-5">
        <ul class="l-header-menu">
          <li class="l-header-item">
            <nuxt-link :to="$i18n.path('')" exact :class="[pathnameUrl === '/' ? 'l-header-link is-active' : 'l-header-link']">{{ $t('menu.home') }}</nuxt-link>
          </li>
          <li class="l-header-item">
            <a class="l-header-link" href="//docs.pwabuilder.com/" target="_blank">{{ $t('menu.documentation') }}</a>
          </li>
          <li class="l-header-item">
            <nuxt-link :to="$i18n.path('imageGenerator')" @click="pathnameUrl='/imageGenerator'" exact 
            :class="[pathnameUrl === '/imageGenerator' ? 'l-header-link is-active' : 'l-header-link ']">
              {{ $t('menu.generator') }}</nuxt-link>
          </li>
          <li class="l-header-item">
            <nuxt-link :to="$i18n.path('windows')" exact :class="[pathnameUrl === '/windows' ? 'l-header-link is-active' : 'l-header-link']">
              {{ $t('menu.windows') }}
            </nuxt-link>
          </li>          
          <li class="l-header-item">
            <a class="l-header-link" href="//github.com/pwa-builder" target="_blank">{{ $t('menu.github') }}</a>
          </li>
        </ul>
      </nav>
    </header>

    <div class="container">
      <nuxt/>
    </div>

    <footer class="l-footer pure-g is-small">
      <div class="pure-u-1-2 pure-u-md-1-5">
        <nuxt-link class="l-footer-action l-footer-action--block active" :to="$i18n.path('')">{{ $t('menu.generate') }}</nuxt-link>
        <a class="l-footer-action l-footer-action--block" href="http://docs.pwabuilder.com/" target="_blank">{{ $t('menu.documentation') }}</a>
      </div>
      <div class="pure-u-1-2 pure-u-md-1-5">
        <a class="l-footer-action l-footer-action--block" href="//appimagegenerator-prod.azurewebsites.net">{{ $t('menu.generator') }}</a>
        <a class="l-footer-action l-footer-action--block" href="https://github.com/pwa-builder" target="_blank">{{ $t('menu.github') }}</a>
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
        {{ $t('footer.copyright') }}<span class="divider">|</span> <a href="https://go.microsoft.com/fwlink/?LinkId=521839" target="_blank" class="l-footer-action">{{ $t('footer.privacy') }}</a>
      </div>
    </footer>
  </div>
</template>
