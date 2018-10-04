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

      this.handleUrl();
    }

    handleUrl() {
      this.$router.beforeEach((to, from, next) => {
        const body = document.querySelector('body');

        if (body) {
          body.setAttribute('location', to.fullPath);
        }
        next();
      });
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

  .bgArt {
    filter: drop-shadow(0 6px 12px rgba(0, 0, 0, .16));
    position: absolute;
    z-index: -1;
  }

  #artw {
    transform: translate(540.87px, -33.78px);
    width: 1705px;
  }
 
  #artb {
    transform: translate(-1502.98px, -324.99px);
    width: 2539.28px;
  }
  
  #artlb {
    transform: translate(0, 565px);
    width: 507px;
  }

  #logoLarge {
    transform: translate(706.2px, 185.6px);
    width: 496.69px;
  }

  #decorStack {
    transform: translate(1134px, 610px);
    width: 128px;
  }

  #bigWhite {
    transform: translate(-1655px, 1278px);
    width: 3309px;
  }
</style>

<template>
  <div>
  <img id="artw" class="bgArt" src="~/assets/images/white.svg">
  <img id="artb" class="bgArt" src="~/assets/images/blue.svg">
  <img id="artlb" class="bgArt" src="~/assets/images/lightBlue.svg">
  <img id="logoLarge" class="bgArt" src="~/assets/images/PWABuilderLogo.svg">  
  <img id="decorStack" class="bgArt" src="~/assets/images/StackedCube.svg">  
  <img id="bigWhite" class="bgArt" src="~/assets/images/white.svg">

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
      </div>
      <div class="pure-u-1-2 pure-u-md-1-5">
     
      </div>
      <div class="l-footer-social pure-u-1 pure-u-md-3-5">
        <a class="l-footer-logo_action" href="https://github.com/pwa-builder" target="_blank">
          <img class="l-footer-logo" src="~/assets/images/logo_github.svg">
        </a>
        <a class="l-footer-logo_action" href="https://www.npmjs.com/package/pwabuilder" target="_blank">
          <img class="l-footer-logo l-footer-logo--big" src="~/assets/images/logo_npm.svg">
        </a>
        <a class="l-footer-logo_action" href="http://stackoverflow.com/questions/tagged/pwabuilder" target="_blank">
          <img class="l-footer-logo l-footer-logo--small" src="~/assets/images/logo_stackoverflow.svg">
        </a>
      </div>
      <div class="pure-u-1 l-footer-copy">
        {{ $t('footer.copyright') }}<span class="divider">|</span> <a href="https://go.microsoft.com/fwlink/?LinkId=521839" target="_blank" class="l-footer-action">{{ $t('footer.privacy') }}</a>
      </div>
    </footer>
  </div>
</template>
