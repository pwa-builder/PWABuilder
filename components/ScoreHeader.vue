<template>
  <header id="scoreHeader">
    <button @click="goBack()" id="backButton">
      <i class="fas fa-chevron-left"></i>
      
      <span>Back</span>
    </button>

    <div id="urlDiv">{{this.url$}}</div>

    <div id="score">
      <nuxt-link to="/reportCard" id="rescanButton">
        <span>Rescan</span>
      </nuxt-link>
      <span v-if="score" id="scoreSpan">{{ score }}</span>
    </div>
  </header>
</template>

<script lang='ts'>
import Vue from "vue";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

import Loading from "~/components/Loading.vue";

import * as generator from "~/store/modules/generator";

const GeneratorState = namespace(generator.name, State);
const GeneratorAction = namespace(generator.name, Action);

@Component({
  components: {
    Loading
  }
})
export default class extends Vue {
  public url$: string | null = null;
  public generatorReady = true;
  public error: string | null = null;

  public score: string | null = null;

  public scrollTarget: HTMLDivElement | null;

  @GeneratorState url: string;
  @GeneratorAction updateLink;
  @GeneratorAction getManifestInformation;

  public created(): void {
    this.url$ = this.url;
  }

  mounted(): void {
    this.score = sessionStorage.getItem("overallGrade");

    this.scrollTarget = document.querySelector("#scrollTarget");

    if (this.scrollTarget && 'animate' in this.$el) {
      const iObserver = new IntersectionObserver(entries => {

        if (entries[0].isIntersecting === true) {
          this.animateBack();
        }
        else {
          this.animateAway();
        }
      });

      iObserver.observe(this.scrollTarget);
    }
  }

  animateAway() {
    this.$el.animate(
      [
        {
          transform: "translateY(0)"
        },
        {
          transform: "translateY(-80px)"
        }
      ],
      {
        fill: "forwards",
        duration: 250,
        easing: 'ease-out'
      }
    );
  }

  animateBack() {
    this.$el.animate(
      [
        {
          transform: "translateY(-80px)"
        },
        {
          transform: "translateY(0)"
        }
      ],
      {
        fill: "forwards",
        duration: 250,
        easing: 'ease-out'
      }
    );
  }

  public get inProgress(): boolean {
    return !this.generatorReady && !this.error;
  }

  public async checkUrlAndGenerate(): Promise<void> {
    this.generatorReady = false;
    this.error = null;

    try {
      this.updateLink(this.url$);

      if (!this.url$) {
        return;
      }

      this.url$ = this.url;
      await this.getManifestInformation();

      this.$router.push({
        name: "generate"
      });
    } catch (e) {
      this.error = e;
    }
  }

  public goBack() {
    window.history.back();
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

#scoreHeader {
  margin-top: 0;
  padding: 0;
  display: flex;
  justify-content: space-between;
  height: 4em;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  align-items: center;
  padding: 16px;
  z-index: 9999;
  position: sticky;
  top: 0;
  background: white;

  #score {
    font-size: 1.6em;
    display: flex;

    #rescanButton {
      border: none;
      border-radius: 20px;
      font-weight: bold;
      font-size: 16px;
      font-weight: bold;
      padding-top: 9px;
      padding-bottom: 9px;
      width: 6em;
      margin-right: 12px;
      background: $color-button-primary-green-variant;
      color: white;
      display: flex;
      justify-content: center;
    }
  }

  #urlDiv {
    font-weight: bold;
  }

  #backButton {
    background: #4a75cc;
    border: none;
    font-weight: bold;
    color: white;
    border-radius: 20px;
    padding-top: 9px;
    padding-bottom: 9px;
    width: 6em;
    display: flex;
    justify-content: center;

    span {
      margin-left: 10px;
    }
  }
}
</style>