<template>
  <header id="scoreHeader">
    <button @click="goBack()" id="backButton">
      <i class="fas fa-chevron-left"></i>
      
      <span>Back</span>
    </button>

    <div id="urlDiv">{{this.url$}}</div>

    <div id="score">
      <div v-if="score" id="scoreSpan">
        {{ score }}
        <span>Overall Grade</span>
      </div>
      <span v-else id="loadingSpan">
        <Loading active></Loading>
      </span>

      <nuxt-link to="/reportCard" id="rescanButton">
        <span>Rescan</span>
      </nuxt-link>
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

  mounted(): void {
    this.url$ = this.url;
    this.score = sessionStorage.getItem("overallGrade");
    this.scrollTarget = document.querySelector("#scrollTarget");

    if (this.scrollTarget && "animate" in this.$el) {
      const iObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting === true) {
          this.animateBack();
        } else {
          this.animateAway();
        }
      });

      iObserver.observe(this.scrollTarget);
    }
  }

  animateAway() {
    (this.$el as any).animate(
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
        easing: "ease-out"
      }
    );
  }

  animateBack() {
    (this.$el as any).animate(
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
        easing: "ease-out"
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
  border-bottom: solid #C5C5C5 1px;
  align-items: center;
  padding: 16px;
  padding-right: 1.6em;
  z-index: 9999;
  position: sticky;
  top: 0;
  background: white;

  #score {
    font-size: 1.6em;
    display: flex;
    font-weight: bold;
    justify-content: center;
    align-items: center;

    #scoreSpan {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-weight: bold;
      font-size: 36px;
      margin-right: 20px;

      span {
        font-size: 12px;
        font-weight: bold;
      }
    }

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
      background: $color-brand-secondary;
      color: white;
      display: flex;
      justify-content: center;
      height: 36px;
    }
  }

  #loadingSpan {
    margin-right: 1em;
    margin-left: 0.6em;
  }

  #urlDiv {
    font-weight: bold;
    font-size: 14px;
  }

  #backButton {
    background: $color-brand-secondary;
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
      margin-left: 11px;
    }
  }
}
</style>