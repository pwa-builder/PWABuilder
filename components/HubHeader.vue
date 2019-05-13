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
        <nuxt-link to="/features">Feature Store</nuxt-link>
      </div>

      <div id="icons">
        <a href="https://github.com/pwa-builder" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-github"></i>
        </a>
        <!--<i class="fab fa-twitter"></i>-->
      </div>
    </header>

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
  @Prop({ default: 0 }) score: number;

  @GeneratorState url: string;

  public localScore: number = 0;
  public calcedScore: number = 0;

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
</script>

<style lang="scss" scoped>
/* stylelint-disable */
@import "~assets/scss/base/variables";

.nuxt-link-exact-active {
  color: white !important;
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
      color: #c5c5c5;
    }
  }

  #icons {
    grid-column: 11 / span 2;
    width: 4em; /* TODO: Padding between instead of width? */

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
      color: #c5c5c5;
    }
  }

  #scoreZone {
    grid-column: 8 / span 5;

    display: flex;
    justify-self: right;
    align-items: center;
  }

  #urlTested {
    color: #c5c5c5;
    display: flex;
    align-items: center;

    padding-right: 32px;

    img {
      height: 2em;
      margin-right: 12px;
    }

    span {
      font-weight: bold;
      font-size: 12px;
      color: #c5c5c5;
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
    }
  }

  #overallScore {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 28px;
    font-weight: bold;
    color: white;
    padding-right: 32px;

    span {
      font-size: 10px;
    }
  }

  #publishButton {
    --color-stop: #11999e;
    --color-start: #7644c2;

    justify-self: right;

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
    background: linear-gradient(
      to right,
      var(--color-start),
      var(--color-stop)
    );
    display: flex;
    justify-content: center;
    align-items: center;

    transition: --color-stop 0.3s, --color-start 0.3s;
  }

  #publishButton:hover {
    --color-stop: #7644c2;
    --color-start: #11999e;
  }
}

@media (max-width: 425px) {
  #subHeader #tabsBar,
  #subHeader #urlTested {
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
    display: none;
  }
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