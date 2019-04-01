  <script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";

import Toolbar from "~/components/Toolbar.vue";

@Component({
  components: {
    Toolbar
  }
})
export default class extends Vue {
  public seen = false;

  public mounted(): void {
    const savedValue = localStorage.getItem("PWABuilderGDPR");
    if (JSON.parse(savedValue as string) !== true) {
      this.seen = true;
      localStorage.setItem("PWABuilderGDPR", JSON.stringify(true));
    }

    this.handleUrl();
  }

  private handleUrl() {
    this.$router.beforeEach((to, _from, next) => {
      const body = document.querySelector("body");

      if (body) {
        const pageName = to.fullPath.replace("/", "");
        body.setAttribute("data-location", pageName);
      }
      next();
    });
  }

  // @ts-ignore TS6133
  private close() {
    this.seen = false;
    localStorage.setItem("PWABuilderGDPR", JSON.stringify(true));
  }
}
</script>

<style lang="scss" scoped>
/* stylelint-disable */
@import "~assets/scss/base/variables";

#baseContainer {
  width: 1280px;

  #scrollTarget {
    width: 100%;
    height: 1em;
    position: absolute;
    top: 5em;
    pointer-events: none;
  }
}

.container {
  width: 100vw;
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
  background: #f2f2f2;
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

/*body[data-location='gettingStarted']{
  
  }

    body[data-location='generate']{
   
  }
  body[data-location='serviceworker']{
     
  }

  body[data-location='publish']{
    
  }

  body[data-location='windows']{
   
  }*/
</style>

<template>
  <div id="baseContainer">
    <div id="scrollTarget"></div>

    <div class="modal-color"></div>
    <h1 class="logoText">PWA Builder</h1>

    <div v-if="seen" id="gdprDiv">
      <p>This site uses cookies for analytics, personalized content and ads. By continuing to browse this site, you agree to this use.</p>

      <div>
        <a
          href="https://privacy.microsoft.com/en-us/privacystatement#maincookiessimilartechnologiesmodule"
        >Learn More</a>
        
        <button id="closeButton" aria-label="Close Button" @click="close()">
          <i aria-hidden="true">✕</i>
        </button>
      </div>
    </div>

    <Toolbar/>

    <div class="container">
      <nuxt/>
    </div>

    <!--<footer class="l-footer pure-g is-small">
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
    </footer>-->
  </div>
</template>

<style lang="scss" scoped>
  @import "~assets/scss/base/variables";

  #gdprDiv {
    align-items: center;
    background: #F2F2F2;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    z-index: 9999;
  }

  #gdprDiv button {
    background: transparent;
    border: none;
    color: #1FC2C8;
  }
</style>
