<template>
  <header id="scoreHeader">
    <button @click="goBack()" id="backButton">
      <i class="fas fa-chevron-left"></i>
      
      <span>Back</span>
    </button>

    <div id="urlDiv">{{this.url$}}</div>

    <div id="score">
      <button id="rescanButton">Rescan</button>
      <span id="scoreSpan">🙂</span>
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

  @GeneratorState url: string;
  @GeneratorAction updateLink;
  @GeneratorAction getManifestInformation;

  public created(): void {
    this.url$ = this.url;
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

/*.headerWrapper {
    display: flex;
    height: 771px;
  }

  #heroImage {
    height: 47rem;
    position: absolute;
    right: 0;
    top: 0;
    width: 80rem;
  }

  #headerImage {
    background: $color-foreground-dark;
    height: 97px;
    margin-right: 15px;
    width: 93px;
  }

  #headerImageBlock {
    display: flex;
    justify-content: space-between;
    margin: 20px;
    z-index: 99;
  }

  header {
    color: $color-brand;
    width: 100%;
  }

  #headerBlock {
    color: $color-brand;
    display: flex;
    justify-content: space-between;
    margin-left: 83px;
    margin-right: 83px;
    margin-top: 8rem;
  }

  #getStartedBlock {
    background: $color-brand;
    color: $color-brand-quintary;
    flex-grow: 1;
  }

  #quickBlockPlaceholder {
    color: #6A6A6A;
    font-size: 16px;
    width: 417px;
  }

  #quickBlockText {
    color: $color-brand-quintary;
    font-size: 36px;
    font-weight: normal;
    width: 439px;
  }

  h1 {
    display: none;
    font-size: 40px;
    font-weight: normal;
    margin: 0;
    width: 125px;
  }

  h2 {
    font-size: 36px;
    font-weight: normal;
  }

  #learnMoreButton {
    background: $color-brand-quintary;
    border: none;
    color: $color-brand;
    font-size: 20px;
    height: 48px;
    margin-top: 58px;
    width: 149px;
  }

  #getStartedButton {
    background: $color-brand-quintary;
    border: none;
    color: $color-brand-primary;
    float: right;
    font-size: 20px;
    height: 48px;
    margin-top: 37px;
    width: 149px;
  }

  #getStartedInput {
    background: $color-brand-quintary;
    border: none;
    border-radius: 10px;
    color: #6A6A6A;
    display: block;
    height: 71px;
    padding-left: 23px;
    width: 491px;
  }

  #placeholderText {
    margin-bottom: 33px;
    width: 297px;
  }

  #titleHeader {
    display: flex;
    margin-left: 33px;
  }

  #manifestButton {
    background: $color-complementary;
    border: none;
    border-radius: 5px;
    box-shadow: 0 7px 9px 0 #002CFF, 0 4px 0 0 #002CFF;
    height: 47px;
    margin-right: 25px;
    width: 92px;
  }

  #manifestBlock {
    z-index: 99;
  }

  #helpButton {
    background: transparent;
    border: none;
    color: $color-brand-quintary;
    margin-right: 89px;
  }

  #rightHeaderBlock {
    color: $color-brand-quintary;
    z-index: 99;
  }

  #leftHeaderBlock {
    z-index: 99;
  }*/

#scoreHeader {
  margin-top: 0;
  padding: 0;
  display: flex;
  justify-content: space-between;
  height: 4em;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
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