  <script lang="ts">
  import Vue from 'vue';
  import Component from 'nuxt-class-component';
  import { Watch } from 'vue-property-decorator';

  @Component({})
  export default class extends Vue {
    public seen: boolean = false;
    // public pathnameUrl: string =  this.$route.path;

    public mounted(): void {
      const savedValue = localStorage.getItem('PWABuilderGDPR');
      if (JSON.parse((savedValue as string)) !== true) {
        this.seen = true;
        localStorage.setItem('PWABuilderGDPR', JSON.stringify(true));
      }
    };

    data() {
      return {
        pathnameUrl: this.$route.path,
      };
    };

    @Watch('$route')
    handleRoute() {
      // this.pathnameUrl = this.$route.path;
    }
  };
</script>

<style lang="scss" scoped>
  @import '~assets/scss/base/variables';

  #gdprDiv {
    animation: slideup;
    animation-duration: 200ms;
    animation-fill-mode: forwards;
    background: white;
    border-radius: 5px 5px 0 0;
    bottom: 0;
    color: $color-brand;
    left: 10rem;
    opacity: 0;
    padding: 16px;
    position: fixed;
    right: 10rem;
    transform: translateY(40px);
    z-index: 9999;
  }

  @keyframes slideup {
    from {
      opacity: 0;
      transform: translateY(40px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
}
</style>


<template>
  <div>
    <div class="container">
      <nuxt/>
    </div>

    <div v-if="seen" id="gdprDiv">
      <p>GDPR Text</p>
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
