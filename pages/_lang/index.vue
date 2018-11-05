
<template>
<section>
  <section id="getStartedBlock">
    <div class="mastHead">
      <h2>{{ $t('home.mast_title') }}</h2>

      <p>{{ $t('home.mast_tag') }}</p>
    </div>

    <div id="bottomBlock">
      <div id="leftBlock">
        <form @submit.prevent="checkUrlAndGenerate" @keydown.enter.prevent="checkUrlAndGenerate">
          <input id="getStartedInput" :aria-label="$t('generator.url')" :placeholder="$t('generator.placeholder_url')" name="siteUrl" type="text" ref="url"
            v-model="url$" autofocus />

          <button @click=" $awa( { 'referrerUri': 'https://preview.pwabuilder.com/build/manifest-scan' })" id="getStartedButton">
            {{ $t('generator.start') }}
            <Loading :active="inProgress" class="u-display-inline_block u-margin-left-sm"/>
          </button>

          <div v-if="error" id='errorBox'>
            {{error}}
          </div>
        </form>
      </div>
    </div>
  </section>
  <section class="pure-g proTag">
    <div id="alreadyPWA"> 
      <h3>Already have an awesome PWA?</h3>
      <nuxt-link to='windows'>
        Click here for a bunch of cool, free extras that you can add to your PWA to make it even better!
      </nuxt-link>
    </div>
  </section>
  <GeneratorMenu :first-link-path="true" />
  <div id="goodPWAHeaderBlock">
    <h2>  {{ $t('home.what_makes_title') }}</h2>
    <p>{{ $t('home.what_makes_body') }}</p>
  </div>
  <div class="homeGood">
    <GoodPWA :allGood="true"/>
  </div>
  <div id="otherTools">
    <div id="otherHeaderBlock">
      <h2>Other useful tools</h2>
    </div>

    <div id="otherBar">
      <div id="otherTool">
        <img />
        <h4>Lorem ipsum so dolor</h4>
        <p>Lorem ipsum so dolor sit amet etc and a quick summary about what a PWA is. Also a link to more information</p>
      </div>

      <div id="otherTool">
        <img />
        <h4>Lorem ipsum so dolor</h4>
        <p>Lorem ipsum so dolor sit amet etc and a quick summary about what a PWA is. Also a link to more information</p>
      </div>

      <div id="otherTool">
        <img />
        <h4>Lorem ipsum so dolor</h4>
        <p>Lorem ipsum so dolor sit amet etc and a quick summary about what a PWA is. Also a link to more information</p>
      </div>

      <div id="otherTool">
        <img />
        <h4>Lorem ipsum so dolor</h4>
        <p>Lorem ipsum so dolor sit amet etc and a quick summary about what a PWA is. Also a link to more information</p>
      </div>
    </div>
  </div>
</section>
</template>



<script lang='ts'>
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Action, State, namespace } from 'vuex-class';

import GeneratorMenu from '~/components/GeneratorMenu.vue';
import GoodPWA from '~/components/GoodPWA.vue';
import Loading from '~/components/Loading.vue';
import * as generator from '~/store/modules/generator';

const GeneratorState = namespace(generator.name, State);
const GeneratorAction = namespace(generator.name, Action);

@Component({
  components: {
    GeneratorMenu,
    Loading,
    GoodPWA
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

  public skipCheckUrl(): void {
    this.$router.push({
      name: 'serviceworker'
    });
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

        // name: 'generate'
        name: 'gettingStarted'
      });
    } catch (e) {
      if (e.message) {
        this.error = e.message;
      } else {
        // No error message
        // so just show error directly
        this.error = e;
      }
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
  @import '~assets/scss/base/variables';
/* stylelint-disable */

  #otherTools {
    display: none;
  }

  .mastHead {
    margin-top: 3em;
    margin-bottom: 9.2em;
  }

  #errorBox {
    color: red;
    position: absolute;
    margin-top: 5px;
  }

  .proTag {
    font-size: 22px;
    margin: 100px 138px 0 138px;
    width: 256px;
  }

  .proTag a,
  .proTag a:visited {
    color: $color-brand-quintary;
    font-size: 16px;
  }

  .proTag h3 {
    color: $color-brand-primary;
    font-size: 24px;
  }

  #whatMakesBlock,
  #otherTools {
    padding-bottom: 48px;
    padding-left: 68px;
    padding-right: 68px;
    padding-top: 65px;
  }

  #quickBlockText {
    color: $color-brand-quintary;
    font-size: 36px;
    margin: 0;
  }
  
  #quickBlockPlaceholder {
    color: $color-brand-quintary;
    font-size: 24px;
  }

  .l-generator-step {
    padding: 0;
  }

  #bottomBlock {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-left: 68px;
    margin-bottom: 3em;
  }

  #getStartedBlock {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
  }

  p {
    font-size: 16px;
  }

  #quickTextBlock {
    margin-bottom: 27px;
    margin-top: 22px;
  }

  #quickTextBlock,
  #leftBlock,
  #alreadyPWA {
    width: 472px;
  }
  
  #getStartedInput {
    border: solid 1px grey;
    border-radius: 1px;
    font-size: 14px;
    padding: 10px;
    width: 280px;
  }

  #goodPWAHeaderBlock {
    color: $color-brand-primary;
    font-size: 16px;
    line-height: 24px;
    margin-left: 138px;
    margin-top: 100px;
    width: 376px;

    h2 {
      color: $color-brand-primary;
      font-size: 24px;
    }
  }

  #getStartedButton {
    background-color: $color-brand-quintary;
    border: none;
    border-radius: 1px;
    color: $color-brand-primary;
    font-size: 14px;
    margin-left: 8px;
    padding: 10px;
    text-align: center;
  }

  #otherTool {
    margin-top: 41px;
    width: 280px;
  }

  #otherTool p {
    width: 184px;
  }

  #otherTool img {
    height: 184px;
    width: 280px;
  }
</style>

