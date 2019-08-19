

<template>
  <div id="baseContainer">
    <div id="scrollTarget"></div>

    <div class="modal-color"></div>
    <h1 class="logoText">PWA Builder</h1>

    <div v-if="seen" id="gdprDiv">
      <div>
        <p>This site uses cookies for analytics, personalized content and ads. By continuing to browse this site, you agree to this use.</p>

        <a
          href="https://privacy.microsoft.com/en-us/privacystatement#maincookiessimilartechnologiesmodule"
        >Learn More</a>
      </div>

      <button id="closeButton" aria-label="Close Button" @click="close()">
        <i class="fas fa-times"></i>
      </button>
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

.container {
  overflow: scroll;
}

#baseContainer {
  #scrollTarget {
    width: 100%;
    height: 1em;
    position: absolute;
    top: 0;
    pointer-events: none;
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
  display: flex;
  flex-direction: row;
  font-size: 13px;
  left: 0;
  right: 0;
  padding-left: 24px;
  padding-right: 24px;
  background: #9337d8;
  color: white;
  justify-content: center;
  height: 52px;
  font-family: 'Open Sans', sans-serif;

  a {
    color: white;
    font-weight: bold;
    text-decoration: underline;
    font-size: 13px;
  }

  div {
    display: flex;
    align-items: center;

    p {
      font-size: 13px;
      margin-right: 20px;
    }
  }

  #closeButton {
    border: none;
    background: none;
    position: relative;
    color: white;
    font-weight: bold;
    font-size: 14px;
    margin-left: 10px;
    margin-top: 0;

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
