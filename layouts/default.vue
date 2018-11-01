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

    private handleUrl() {
      this.$router.beforeEach((to, from, next) => {
        const body = document.querySelector('body');

        if (body) {
          const pageName = to.fullPath.replace('/', '');
          body.setAttribute('data-location', pageName);
        }
        next();
      });
    }

    private close() {
      console.log('close pressed');
    }
  }
</script>

<style lang="scss" scoped>
/* stylelint-disable */
  @import '~assets/scss/base/variables';

  #baseContainer{
    width: 1280px;
    margin: 0 auto;

    .container {
      padding-top: 64px;
    }
  }

header {
  display: none !important;
}


  .logoText {
    position: absolute;
    top: -400px;
    font-size: 16px;
    line-height: 16px;
    width: 100px;
  }

  #gdprDiv {
    align-items: center;
    background: #F2F2F2;
    display: flex;
    flex-direction: row;
    font-size: 14px;
    justify-content: space-between;
    z-index: 9999;
    position: absolute;
    left: 0;
    right: 0;
    padding-left: 24px;
    padding-right: 24px;

    div {
      display: flex;
      justify-content: space-between;
      width: 8em;
    }

    #closeButton {
      border: none;
      background: none;

      i {
        font-style: normal;
      }
    }
  }

  .bgArt {
    filter: drop-shadow(0 6px 12px rgba(0, 0, 0, .16));
    position: absolute;
    z-index: -1;
    transition-property: width transform;
    transition-duration: .7s;
    transition-timing-function: ease-in-out;
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
    transform: translate(0, 512px);
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
    transform: translate(-1655px, 1248px);
    width: 3309px;
  }

  body[data-location='gettingStarted']{
    .logoText {
      transform: translatex(1160px);  
      top: 26px;
    }

    #artb {
      transform: translate(-1584px, -1380px);
      width: 3688px;
     }

    #artw {
      transform: translate(800px, -258px);
      width: 833px;
    }

    #artlb {
      transform: translate(729px, -46px);
      width: 1101px;
    }
    #logoLarge {
      transform: translate(1110px, 32px);
      width: 48px;
    }
    #decorStack {
      transform: translate(729px, 148px);
      width: 128px;
    }

    #bigWhite {
      transform: translate(-1655px, 1278px);
      width: 1px;
    }
  }

    body[data-location='generate']{
     .logoText {
      transform: translatex(1160px);
      top: 26px;
    }

    #artb {
      transform: translate(-1584px, -1462px);
      width: 3688px;
     }

    #artw {
      transform: translate(800px, -258px);
      width: 833px;
    }

    #artlb {
      transform: translate(729px, -128px);
      width: 1101px;
    }
    #logoLarge {
      transform: translate(1110px, 32px);
      width: 48px;
    }
    #decorStack {
      transform: translate(729px, 68px);
      width: 128px;
    }

    #bigWhite {
      transform: translate(-1655px, 1278px);
      width: 1px;
    }
  }
  body[data-location='serviceworker']{
     .logoText {
      transform: translatex(1160px);      
      top: 26px;
    }

    #artb {
      transform: translate(-1584px, -1462px);
      width: 3688px;
     }

    #artw {
      transform: translate(800px, -258px);
      width: 833px;
    }

    #artlb {
      transform: translate(729px, -128px);
      width: 1101px;
    }
    #logoLarge {
      transform: translate(1110px, 32px);
      width: 48px;
    }
    #decorStack {
      transform: translate(729px, 68px);
      width: 128px;
    }

    #bigWhite {
      transform: translate(-1655px, 1278px);
      width: 1px;
    }
  }

  body[data-location='publish']{
      .logoText {
      transform: translatex(1160px);
      top: 26px;
    }

    #artb {
      transform: translate(-1584px, -1380px);
      width: 3688px;
     }

    #artw {
      transform: translate(800px, -258px);
      width: 833px;
    }

    #artlb {
      transform: translate(729px, -46px);
      width: 1101px;
    }
    #logoLarge {
      transform: translate(1110px, 32px);
      width: 48px;
    }
    #decorStack {
      transform: translate(729px, 148px);
      width: 128px;
    }

    #bigWhite {
      transform: translate(-1655px, 1278px);
      width: 1px;
    }
  }

  body[data-location='windows']{
      .logoText {
      transform: translatex(1160px);
      top: 26px;
    }

    #artb {
      transform: translate(-1584px, -1462px);
      width: 3688px;
     }

    #artw {
      transform: translate(800px, -258px);
      width: 833px;
    }

    #artlb {
      transform: translate(729px, -128px);
      width: 1101px;
    }
    #logoLarge {
      transform: translate(1110px, 32px);
      width: 48px;
    }
    #decorStack {
      transform: translate(729px, 68px);
      width: 128px;
    }

    #bigWhite {
      transform: translate(-1655px, 1278px);
      width: 1px;
    }
  }


</style>

<template>
  <div id="baseContainer">
  <img id="artb" class="bgArt" src="~/assets/images/blue.svg">
  <img id="artlb" class="bgArt" src="~/assets/images/lightBlue.svg">
  <img id="artw" class="bgArt" src="~/assets/images/white.svg">
  <img id="logoLarge" class="bgArt" src="~/assets/images/PWABuilderLogo.svg">  
  <img id="decorStack" class="bgArt" src="~/assets/images/StackedCube.svg">  
  <img id="bigWhite" class="bgArt" src="~/assets/images/white.svg">
  <h1 class="logoText">PWA Builder</h1>

    <div v-if="seen" id="gdprDiv">
      <p>This site uses cookies for analytics, personalized content and ads. By continuing to browse this site, you agree to this use.</p>

      <div>
        <a href="https://privacy.microsoft.com/en-us/privacystatement#maincookiessimilartechnologiesmodule">Learn More</a>

        <button id="closeButton" @click="close()">
          <i aria-hidden="true">✕</i>
        </button>
      </div>
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
