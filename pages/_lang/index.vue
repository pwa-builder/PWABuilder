
<template>
<section>
  <div class="l-generator-step">
    <div class="pure-g padding">
      <section id="getStartedBlock">
        <div id="quickTextBlock">
          <h2 id="quickBlockText">{{ $t('home.mast_title') }}</h2>

          <p id="quickBlockPlaceholder">{{ $t('home.mast_tag') }}</p>
        </div>

        <div id="bottomBlock">
          <div id="leftBlock">
            <h2 id="getStartedHere">Get Started!</h2>

            <p id='placeholderText'>Enter the URL of the website you want to convert to a Progressive Web App below</p>

            <form @submit.prevent="checkUrlAndGenerate" @keydown.enter.prevent="checkUrlAndGenerate">
              <input id="getStartedInput" :aria-label="$t('generator.url')" :placeholder="$t('generator.placeholder_url')" name="siteUrl" type="text" ref="url"
                v-model="url$" autofocus />

              <button @click=" $awa( { 'referrerUri': 'https://preview.pwabuilder.com/build/manifest-scan' })" id="getStartedButton">
                {{ $t('generator.start') }}
              </button>
            </form>
          </div>

          <div id="alreadyPWA">
            <h3>Or if you're already familiar with PWAs...</h3>
            <a href="">Take me straight to the APIs, extensions, and other good stuff!</a>
          </div>
        </div>
      </section>
    </div>
  </div>

  <GeneratorMenu :first-link-path="true" />

  <div class="l-generator-step">
    <div id="whatMakesBlock">
      <div id="goodPWAHeaderBlock">
        <h2 id="quickBlockText">  {{ $t('home.what_makes_title') }}</h2>
        <p>{{ $t('home.what_makes_body') }}</p>
      </div>

      <div id="goodBetterBar">
        <div>
          <h3>{{ $t('home.quality_low_title') }}</h3>
          <ul>
            <li>{{ $t('home.quality_low_list_1') }}</li>
            <li>{{ $t('home.quality_low_list_2') }}</li>
            <li>{{ $t('home.quality_low_list_3') }}</li>
          </ul>
        </div>

        <div>
          <h3>{{ $t('home.quality_mid_title') }}</h3>
          <ul>
            <li>{{ $t('home.quality_mid_list_1') }}</li>
            <li>{{ $t('home.quality_mid_list_2') }}</li>
            <li>{{ $t('home.quality_mid_list_3') }}</li>
          </ul>
        </div>

        <div>
          <h3>{{ $t('home.quality_high_title') }}</h3>
          <ul>
            <li>{{ $t('home.quality_high_list_1') }}</li>
            <li>Uses a fully completed manifest</li>
            <li>Uses Service Workers to enable offline use cases</li>
            <li>Integrates with native features in the operating system</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div id="otherTools">
    <div id="otherHeaderBlock">
      <h2 id="quickBlockText">Other useful tools</h2>
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
// import TwoWays from "~/components/TwoWays.vue";
import Loading from '~/components/Loading.vue';
import * as generator from '~/store/modules/generator';

const GeneratorState = namespace(generator.name, State);
const GeneratorAction = namespace(generator.name, Action);

@Component({
  components: {
    // TwoWays,
    GeneratorMenu,
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
        name: 'generate'
      });
    } catch (e) {
      this.error = e;
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

  .padding {
    padding-bottom: 48px;
    padding-left: 68px;
    padding-right: 190px;
    padding-top: 64px;
    width: 100%;
  }

  #whatMakesBlock,
  #otherTools {
    padding-bottom: 48px;
    padding-left: 68px;
    padding-right: 68px;
    padding-top: 65px;
  }

  #quickBlockText {
    font-size: 32px;
    font-weight: 600;
    margin: 0;
  }

  .l-generator-step {
    padding: 0;
  }

  #bottomBlock {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  #getStartedBlock {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
  }

  p {
    font-size: 18px;
  }

  #quickTextBlock {
    margin-bottom: 27px;
  }

  #quickTextBlock,
  #leftBlock,
  #alreadyPWA,
  #goodPWAHeaderBlock {
    width: 472px;
  }
  
  #getStartedInput {
    border: solid 1px grey;
    border-radius: 25px;
    font-size: 14px;
    padding: 10px;
    width: 280px;
  }

  #getStartedButton {
    background: $color-brand;
    border: none;
    border-radius: 25px;
    color: white;
    font-size: 14px;
    margin-left: 8px;
    padding: 10px;
    text-align: center;
  }

  #goodBetterBar,
  #otherBar {
    display: flex;
    justify-content: space-between;
  }

  #goodBetterBar h3 {
    font-size: 32px;
    font-weight: 400;
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

