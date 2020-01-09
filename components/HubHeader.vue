<template>
  <div>
    <header :class="{ 'smaller-header': !expanded }">
      <img
        id="logo"
        src="~/assets/images/new-logo.svg"
        alt="App Logo"
        class="logo-size"
        :class="{ 'smaller-logo': !expanded }"
        @click="reset()"
      >

      <div id="mainTabsBar">
        <nuxt-link to="/">My Hub</nuxt-link>
        <nuxt-link
          @click="$awa( { 'referrerUri': `https://pwabuilder.com/features` })"
          to="/features"
        >Feature Store</nuxt-link>
      </div>

      <div id="icons">
        <InstallButton/>

        <a href="https://github.com/pwa-builder" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-github"></i>
        </a>
        <!--<i class="fab fa-twitter"></i>-->
      </div>
    </header>

    <div id="featureDetailButtons" v-if="showFeatureDetailButton">
      <button id="backButton">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div id="featDetailTitle"></div>

      <button v-if="showFeatureDetailGraphButton" id="featDetailDocsButton" class="featDetailButton">
        <i class="fas fa-book"></i>
        <span>Docs</span>
      </button>

      <button id="githubSnippitButton" class="featDetailButton">
        <i class="fab fa-github"></i>
        <span>Github</span>
      </button>

      <button id="featDetailShareButton" class="featDetailButton">
        <i class="fas fa-share-alt"></i>
        <span>Share</span>
      </button>
    </div>

    <div class="has-acrylic-80 is-dark has-reveal-background" v-if="showSubHeader" id="subHeader">
      <div id="tabsBar">
        <nuxt-link to="/">Overview</nuxt-link>
        <nuxt-link to="/generate">Manifest</nuxt-link>
        <nuxt-link to="/serviceworker">Service Worker</nuxt-link>
      </div>

      <div id="scoreZone">
        <div id="urlTested">
          <img src="~/assets/images/score-icon.png" alt="score icon">

          <a target="_blank" rel="noopener noreferrer" :href="url">
            <span>
              URL Tested
              <i class="fas fa-external-link-alt"></i>
            </span>
            <span v-if="url">
              {{url.replace('http://','').replace('https://','').split(/[/?#]/)[0]}}
            </span>      
          </a>
        </div>

        <div id="overallScore">
          {{calcedScore}}
          <span>Your Score</span>
        </div>

        <nuxt-link
          class="enabled"
          id="publishButton"
          to="/publish"
        ></nuxt-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Prop, Watch } from "vue-property-decorator";
import Component from "nuxt-class-component";
import { State, namespace } from "vuex-class";

import * as generator from "~/store/modules/generator";

import InstallButton from "~/components/InstallButton.vue";

const GeneratorState = namespace(generator.name, State);

@Component({
  components: {
    InstallButton
  }
})
export default class extends Vue {
  @Prop({ default: false }) expanded: boolean;
  @Prop({}) showSubHeader: string;
  @Prop({ default: false }) showFeatureDetailButton: boolean;
  @Prop({ default: false }) showFeatureDetailGraphButton: boolean;
  @Prop({ default: 0 }) score: number;

  @GeneratorState url: string;
  public localScore: number = 0;
  public calcedScore: number = 0;
  readyToPublish: boolean = false;
  @GeneratorState manifest: any;

  mounted() {
    const storedScore = sessionStorage.getItem("overallGrade") || null;

    if (storedScore) {
      this.calcedScore = parseInt(storedScore);
    } else {
      this.calcedScore = this.score;

      if ((window as any).CSS && (window as any).CSS.registerProperty) {
        try {
          (CSS as any).registerProperty({
            name: "--color-stop",
            syntax: "<color>",
            inherits: false,
            initialValue: "transparent"
          });

          (CSS as any).registerProperty({
            name: "--color-start",
            syntax: "<color>",
            inherits: false,
            initialValue: "transparent"
          });
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  @Watch("score")
  onScoreChanged() {
    this.calcedScore = this.score;
  }

  updated() {
    console.log("updated", this.score);
    if (this.manifest) {
      this.readyToPublish = true;
    } 
    if ("requestIdleCallback" in window) {
      // Use requestIdleCallback to schedule this since its not "necessary" work
      // and we dont want this running in the middle of animations or user input
      if (this.score) {
        (window as any).requestIdleCallback(
          () => {
            sessionStorage.setItem("overallGrade", this.score.toString());
          },
          {
            timeout: 2000
          }
        );
      }
    } else {
      if (this.score) {
        sessionStorage.setItem("overallGrade", this.score.toString());
      }
    }
  }

  reset() {
    console.log("here");
    if (location.pathname === "/") {
      this.$emit("reset");
    } else {
      history.back();
    }
  }
}

declare var awa: any;

Vue.prototype.$awa = function(config) {
  awa.ct.capturePageView(config);
  return;
};
</script>

<style lang="scss" scoped>
/* stylelint-disable */
@import "~assets/scss/base/variables";

.nuxt-link-exact-active {
  color: rgba(255, 255, 255, 1) !important;
}

.smaller-header {
  background-color: black;
  height: 52px;
}

header {
  background-color: rgba(0, 0, 0, 0.2);
  height: 104px;

  transition: background-color 500ms, height 500ms ease-in-out;

  @include grid;
  grid-template-rows: auto;

  align-items: center;
  justify-content: space-between;
  color: white;
  z-index: 1;

  #logoLink {
    grid-column: 1 / span 2;

    border: none;
  }

  img {
    max-width: none;
  }

  /* TODO: Can some of this be shared with tabsBar below at all? */
  #mainTabsBar {
    grid-column: 3 / span 8;
    justify-self: center;
    width: 14em; /* TODO: Adjust to put padding between elements instead. */

    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 14px;

    a {
      padding-bottom: 6px;
      font-family: Poppins;
      font-style: normal;
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;
      display: flex;
      align-items: center;
      text-align: center;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.7);
    }

    a:hover {
      color: white !important;
    }
  }

  #icons {
    grid-column: 11 / span 2;

    display: flex;
    justify-content: space-around;
    justify-self: right;
    align-items: center;
  }
}

@media (max-width: 425px) {
  header {
    padding: 0 0px;
  }

  #logo {
    height: 36px;
  }

  .smaller-header {
    padding-left: 25px;
  }
}

#subHeader {
  @include grid;

  grid-template-columns: 3fr 2fr;
  // background: rgba(60, 60, 60, 0.8);
  align-items: center;
  justify-content: space-between;
  height: 56px;
  animation-name: slidedown;
  animation-duration: 300ms;
  animation-iteration-count: 1;
  z-index: -1;
  width: 100%;

  #tabsBar {
    grid-column: 1 / span 7;
    width: 24em; /* TODO: Adjust to put padding between elements instead. */

    display: flex;
    justify-content: space-between;
    padding-top: 10px;
    padding-bottom: 10px;
    font-size: 14px;
    font-weight: bold;

    a {
      padding-bottom: 6px;
      color: rgba(255, 255, 255, 0.7);

      font-weight: normal;
      font-size: 14px;
      line-height: 19px;
      text-align: center;
      font-family: 'Open Sans', sans-serif;
    }
  }

  #scoreZone {
    grid-column: 8 / span 5;

    display: flex;
    justify-self: right;
    align-items: center;
  }

  @media (max-width: 960px) {
    #scoreZone {
      grid-column: 7 / span 6;
    }

    #tabsBar {
      grid-column: 1;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      align-items: center;
    }
  }

  @media (max-width: 806px) {
    #urlTested {
      display: none !important;
    }

    #scoreZone {
      grid-column: 2;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 1138px) {
    #overallScore span {
      display: none !important;
    }

    #overallScore:after {
      content: 'score';
      font-size: 12px;
      line-height: 16px;
    }
  }

  #urlTested {
    color: rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: center;

    padding-right: 32px;

    img {
      height: 2em;
      margin-right: 12px;
    }

    span {
      color: rgba(255, 255, 255, 0.7);

      font-style: normal;
      font-weight: normal;
      font-size: 12px;
      line-height: 16px;
    }

    span svg {
      margin-left: 5px;
    }

    a {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      font-weight: normal;
      display: flex;
      flex-direction: column;
      font-weight: bold;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  #urlTested:hover {
    span,
    a {
      color: rgba(255, 255, 255, 1);
    }
  }

  #urlTested span:hover {
    color: rgba(255, 255, 255, 1);
  }

  #overallScore {
    display: flex;
    flex-direction: column;
    padding-right: 32px;

    font-family: Poppins;
    font-style: normal;
    font-weight: 800;
    font-size: 32px;
    line-height: 26px;
    display: flex;
    align-items: center;
    text-align: center;
    color: #ffffff;

    span {
      font-style: normal;
      font-weight: bold;
      font-size: 12px;
      line-height: 16px;
      display: flex;
      align-items: center;
      text-align: center;
      letter-spacing: -0.04em;
      color: #ffffff;
      text-transform: lowercase;
      letter-spacing: -0.04em;
      font-family: 'Open Sans', sans-serif;
    }
  }

  #publishButton {
    justify-self: right;
    border-radius: 22px;
    border: none;
    display: flex;
    justify-content: center;
    padding-left: 20px;
    padding-right: 20px;
    font-family: Poppins;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    display: flex;
    align-items: center;
    text-align: center;
    height: 40px;
  }

  #publishButton:after {
    content: 'Build My PWA';
  }

  @media (max-width: 630px) {
    #publishButton:after {
      content: 'Build';
    }
  }
}

@media (max-width: 425px) {
  #overallScore {
    padding-right: 0px !important;
    padding-left: 20px;
  }

  #subHeader #publishButton {
    display: none;
  }

  #subHeader {
    display: flex;
    padding: 0 0px;
    justify-content: space-around;
  }
}

.logo-size {
  height: 52px;
  width: 140px;

  transition: height 500ms ease-in-out, width 500ms ease-in-out;
}

#logo:hover {
  cursor: pointer;
}

.smaller-logo {
  height: 32px;
  width: 86px;
}

a {
  color: white;
  text-decoration: none;
}

@media (max-width: 425px) {
  #icons a {
    position: fixed;
    left: 5px;
    bottom: 10px;
    width: 16px;
    height: 16px;
  }

  #icons a svg {
    width: 100%;
    height: 100%;
    color: black;
  }
}

@media (max-height: 350px) {
  #icons a {
    display: none;
  }
}

a:hover {
  box-shadow: none;
}

.disabled {
  background: linear-gradient(to right, #b3d2d3, #cbb9d8 116%);
  color: #878489;
  pointer-events: none;
}

.enabled {
  background: linear-gradient(to right, #1fc2c8, #9337d8 116%);
  color: #ffffff;
}

@keyframes slidedown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>