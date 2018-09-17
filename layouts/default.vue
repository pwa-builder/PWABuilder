  <script lang="ts">
  import Vue from 'vue';
  import Component from 'nuxt-class-component';

  import Toolbar from '~/components/Toolbar.vue';

  @Component({
    components: {
      Toolbar
    }
  })
  export default class extends Vue {
   
    public seen = false;

    public mounted(): void {
      const savedValue = localStorage.getItem('PWABuilderGDPR');
      if (JSON.parse((savedValue as string)) !== true) {
        this.seen = true;
        localStorage.setItem('PWABuilderGDPR', JSON.stringify(true));
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '~assets/scss/base/variables';

  #gdprDiv {
    align-items: center;
    background: #F2F2F2;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    z-index: 9999;
  }
</style>


<template>
  <div>
    <div v-if="seen" id="gdprDiv">
      <p>This site uses cookies for analytics, personalized content and ads. By continuing to browse this site, you agree to this use.</p>
      <a href="https://privacy.microsoft.com/en-us/privacystatement#maincookiessimilartechnologiesmodule">Learn More</a>
    </div>

    <Toolbar />

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
