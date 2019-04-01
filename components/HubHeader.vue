<template>
  <div>
    <header :class="{ 'smaller-header': !expanded }">
      <nuxt-link id="logoLink" to="/">
        <img id="logo" src="~/assets/images/new-logo.svg" alt="App Logo"
             class="logo-size"
             :class="{ 'smaller-logo': !expanded }">
      </nuxt-link>

      <div id="mainTabsBar">
        <nuxt-link to="/">My Hub</nuxt-link>
        <nuxt-link to="/features">Feature Store</nuxt-link>
      </div>

      <div id="icons">
        <a href="https://github.com/pwa-builder" target="_blank">
          <i class="fab fa-github"></i>
        </a>
        <i class="fab fa-twitter"></i>
      </div>
    </header>

    <div v-if="showSubHeader" id="subHeader">
      <div id="tabsBar">
        <nuxt-link to="/">Overview</nuxt-link>
        <nuxt-link to="/generate">Manifest</nuxt-link>
        <nuxt-link to="/serviceworker">Service Worker</nuxt-link>
        <nuxt-link to="/features">Security</nuxt-link>
      </div>

      <div id="subHeaderExtras">
        <div id="urlTested">
          <a :href="url">
            <span>
              URL Tested
              <i class="fas fa-external-link-alt"></i>
            </span>
            {{url.replace('http://','').replace('https://','').split(/[/?#]/)[0]}}
          </a>
        </div>

        <div id="overallScore">
          {{calcedScore}}
          <span>Your Score</span>
        </div>

        <nuxt-link id="publishButton" to="/publish">Build My PWA</nuxt-link>
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

const GeneratorState = namespace(generator.name, State);

@Component({})
export default class extends Vue {
  @Prop({ default: false }) expanded: boolean;
  @Prop({}) showSubHeader: string;
  @Prop({ default: 0 }) score: number | string;

  @GeneratorState url: string;

  public localScore: number = 0;
  public calcedScore: number = 0;

  mounted() {
    const storedScore = sessionStorage.getItem("overallGrade") || null;

    if (storedScore) {
      this.localScore = parseInt(storedScore);
    }

    console.log(this.score);

    if (this.score < 100 || this.localScore < 100) {
      this.calcedScore = 60;
    } else if (
      (this.score > 100 && this.score < 150) ||
      (this.localScore > 100 && this.localScore < 150)
    ) {
      this.calcedScore = 80;
    } else if (
      (this.score > 150 && this.score < 200) ||
      (this.localScore > 150 && this.localScore < 200)
    ) {
      this.calcedScore = 90;
    } else if (this.score === 200 || this.localScore === 200) {
      this.calcedScore = 100;
    }
  }

  @Watch("score")
  onScoreChanged() {
    console.log("score changed", this.score);

    if (this.score < 100 || this.localScore < 100) {
      this.calcedScore = 60;
    } else if (
      (this.score > 100 && this.score < 150) ||
      (this.localScore > 100 && this.localScore < 150)
    ) {
      this.calcedScore = 80;
    } else if (
      (this.score > 150 && this.score < 200) ||
      (this.localScore > 150 && this.localScore < 200)
    ) {
      this.calcedScore = 90;
    } else if (this.score === 200 || this.localScore === 200) {
      this.calcedScore = 100;
    }
  }

  updated() {
    console.log("updated", this.score);
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
}
</script>

<style lang="scss" scoped>
/* stylelint-disable */
@import "~assets/scss/base/variables";

.nuxt-link-exact-active {
  border-bottom: solid 2px #1fc2c8;
  color: white !important;
}

#publishButton {
  height: 42px;
  width: 120px;
  border-radius: 22px;
  border: none;
  background: grey;
  font-weight: bold;
  font-size: 14px;
  padding-top: 9px;
  padding-bottom: 11px;
  color: white;
  background: $color-button-primary-purple-variant;
  display: flex;
  justify-content: center;
  align-items: center;
}

.smaller-header {
  background-color: black;
  height: 52px;
}

header {
  background-color: rgba(0, 0, 0, 0.7);  
  height: 104px;

  transition: background-color 500ms, height 500ms ease-in-out;

  display: flex;
  align-items: center;
  padding-left: 160px;
  padding-right: 160px;
  justify-content: space-between;
  color: white;
  z-index: 1;

  #mainTabsBar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 14em;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 14px;

    a {
      padding-bottom: 6px;
      color: #c5c5c5;
    }
  }

  #icons {
    width: 4em;
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-right: 10px;
  }
}

#subHeader {
  background: rgba(60, 60, 60, 0.8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  animation-name: slidedown;
  animation-duration: 300ms;
  animation-iteration-count: 1;
  z-index: -1;
  width: 100%;
  padding-left: 160px;
  padding-right: 160px;
  z-index: -1;

  #tabsBar {
    display: flex;
    width: 26em;
    justify-content: space-between;
    padding-top: 10px;
    padding-bottom: 10px;
    font-size: 14px;
    font-weight: bold;

    a {
      padding-bottom: 6px;
      color: #c5c5c5;
    }
  }

  #subHeaderExtras {
    display: flex;
    align-items: center;
    width: 20em;
    justify-content: space-between;
    margin-left: 9em;

    #overallScore {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 28px;
      font-weight: bold;
      color: white;

      span {
        font-size: 10px;
      }
    }
  }
}

#urlTested {
  color: #c5c5c5;
}

#urlTested span {
  font-weight: bold;
  font-size: 12px;
  color: #c5c5c5;
}

#urlTested a {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: normal;
  display: flex;
  flex-direction: column;
}

.logo-size {
  height: 52px;
  width: 140px;

  transition: height 500ms ease-in-out, width 500ms ease-in-out;
}

.smaller-logo {
  height: 32px;
  width: 86px;  
}

header #logoLink {
  border: none;
}

a {
  color: white;
  text-decoration: none;
}

a:hover {
  box-shadow: none;
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