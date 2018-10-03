
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
            <form @submit.prevent="checkUrlAndGenerate" @keydown.enter.prevent="checkUrlAndGenerate">
              <input id="getStartedInput" :aria-label="$t('generator.url')" :placeholder="$t('generator.placeholder_url')" name="siteUrl" type="text" ref="url"
                v-model="url$" autofocus />

              <button @click=" $awa( { 'referrerUri': 'https://preview.pwabuilder.com/build/manifest-scan' })" id="getStartedButton">
                {{ $t('generator.start') }}
                <Loading :active="inProgress" class="u-display-inline_block u-margin-left-sm"/>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  </div>
  <section class="pure-g proTag">
    <div id="alreadyPWA"> 
      <h3>Already have an awesome PWA?</h3>
      <a href="">Click here for a bunch of cool, free extras that you can add to your PWA to make it even better!</a>
    </div>
  </section>
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
import Loading from '~/components/Loading.vue';
import * as generator from '~/store/modules/generator';

const GeneratorState = namespace(generator.name, State);
const GeneratorAction = namespace(generator.name, Action);

@Component({
  components: {
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
        name: 'gettingStarted'
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
    margin-bottom: 100px;
    margin-left: 138px;
    padding-bottom: 48px;
    padding-right: 190px;
    padding-top: 64px;
    width: 100%;
  }

  .proTag {
    font-size: 22px;
    margin: 134px 138px 0 138px;
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
    font-weight: 600;
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

