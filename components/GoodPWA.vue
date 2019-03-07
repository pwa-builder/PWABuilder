<template>
 <div id='wrapper'>

  <div class="goodBetterBar">
    <div v-bind:class="{selectedBox: highlightFirst}" v-if="statusState" class="choiceCol">
      <h3>{{ $t('home.quality_low_title') }}</h3>
      <ul>
        <li v-bind:class="{ good: statusState.isHttps || allGood }">
          <h3>{{ $t('home.quality_low_list_1') }}</h3>
          <p class='paramText'>Your site is secure!</p>
        </li>
        <li v-bind:class="{ good: statusState.hasManifest || allGood }">
          <h3>{{ $t('home.quality_low_list_2') }}</h3>
          <p class='paramText'>
            A basic W3C manifest is a signle your website is an app.
            <nuxt-link to="/generate">
              Add to the Manifest
            </nuxt-link>
          </p>
          
        </li>
        <li v-bind:class="{ good: statusState.hasWorker || allGood }">
          <h3>{{ $t('home.quality_low_list_3') }}</h3>
          <p class='paramText'>Your site should still do something when your user is offline.
            <nuxt-link to="/serviceworker">
              Add a Service Worker
            </nuxt-link>
          </p>
        </li>
      </ul>
      <nuxt-link to="/publish" class="publish work-button">
        Publish Your App
      </nuxt-link>

     </div>

    <div v-bind:class="{selectedBox: highlightSecond}" v-if="statusState" class="choiceCol">
      <h3>{{ $t('home.quality_mid_title') }}</h3>
      <ul>
        <li v-bind:class="{ good: statusState.hasBetterWorker || allGood }">
          <h3>{{ $t('home.quality_mid_list_1') }}</h3>
          <p class='paramText'>Your Service worker should manage traffic for offline funcatinality and app like performance.
           <nuxt-link to="/serviceworker">
             Add a Service Worker
           </nuxt-link>
          </p>
        </li>
        <li v-bind:class="{ good: statusState.hasBetterManifest || allGood }">
          <h3>{{ $t('home.quality_mid_list_2') }}</h3>
          <p class='paramText'>The manifest becomes more useful with more data.  We recommend App name, theme colors and a large tile / icon image.
           <nuxt-link to="/generate">
             Add to the Manifest
           </nuxt-link>
          </p>

        </li>
      </ul>
    </div>

    <div v-bind:class="{selectedBox: highlightThird}" v-if="statusState" class="choiceCol">
      <h3>{{ $t('home.quality_high_title') }}</h3>
      <ul>
        <li v-bind:class="{ good: statusState.hasNativeFeatures || allGood }">
          <h3>{{ $t('home.quality_high_list_1') }}</h3>
          <p class='paramText'>The Best PWAs can replace native apps.  Add app like functionality for the best PWA experience. 
           <nuxt-link to="/features">
             Add App-like features
           </nuxt-link>
          </p>

        </li>
      </ul>
    </div>
  </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Prop } from 'vue-property-decorator';
import { State, namespace } from 'vuex-class';

import * as generator from '~/store/modules/generator';
import * as serviceworker from '~/store/modules/serviceworker';

const GeneratorState = namespace(generator.name, State);
const ServiceworkerState = namespace(serviceworker.name, State);

@Component({})
export default class extends Vue {
  @Prop({ default: true })
  isHttps: boolean;
  // @Prop({}) hasManifest: boolean;
  // @Prop({}) hasBetterManifest: boolean;
  // @Prop({}) hasBestManifest: boolean;
  @Prop({})
  hasBestWorker: boolean;
  @Prop({})
  hasNativeFeatures: boolean;
  @Prop({})
  isResponsive: boolean;
  @Prop({})
  allGood: boolean;
  @Prop({})
  allGoodWithText: boolean;

  @GeneratorState
  manifest: generator.Manifest;

  @ServiceworkerState serviceworker: number;

  statusState: any = null;
  hasManifest = false;
  hasBetterManifest = false;
  hasBestManifest = false;
  hasBetterWorker: boolean;
  hasWorker: boolean;

  highlightFirst = false;
  highlightSecond = false;
  highlightThird = false;

  public mounted() {
    this.analyzeManifest(this.manifest);
    this.analyzeServiceWorker(this.serviceworker);
    this.handleState();
  }

  private handleState() {
        // trying to grab the previous saved state
    // this will be null if not found
    const savedStatus = sessionStorage.getItem('pwaStatus');

    // lets set our starting state based on the props we
    // just received
    const currentStatus = {
      isHttps: this.isHttps,
      hasManifest: this.hasManifest,
      hasWorker: this.hasWorker,
      hasBetterManifest: this.hasBetterManifest,
      hasBetterWorker: this.hasBetterWorker,
      hasBestManifest: this.hasBestManifest,
      hasBestWorker: this.hasBestWorker,
      hasNativeFeatures: this.hasNativeFeatures,
      isResponsive: this.isResponsive
    };
    console.log(currentStatus);

    if (savedStatus !== null) {
      // if we have saved state lets merge that
      // and our current state based off our current props
      // and finally save it and set it as the state
      sessionStorage.setItem(
        'pwaStatus',
        JSON.stringify({ ...currentStatus, ...JSON.parse(savedStatus) })
      );
      this.statusState = { ...currentStatus, ...JSON.parse(savedStatus) };
    } else {
      // if we dont have any saved state
      // lets save our current state and then just display it
      localStorage.setItem('pwaStatus', JSON.stringify(currentStatus));
      this.statusState = currentStatus;
    }

    if (
      !this.statusState.isHttps ||
      !this.statusState.hasManifest ||
      !this.statusState.hasWorker
    ) {
      this.highlightFirst = true;
    } else if (
      !this.statusState.hasBetterManifest ||
      !this.statusState.hasBetterWorker
    ) {
      this.highlightSecond = true;
    } else if (!this.statusState.hasNativeFeatures) {
      this.highlightThird = true;
    } else {
      this.highlightThird = true;
    }
  }

  private analyzeManifest(manifest) {
    // we already know we have a manifest by this point
    this.hasManifest = true;
    console.log('analyzing', manifest);

    // does the manifest have icons?
    if (manifest && manifest.icons && manifest.icons.length > 0) {
      this.hasBetterManifest = true;
    }
  }

  public analyzeServiceWorker(worker): void {
    if (worker >= 4) {
      this.hasBetterWorker = true;
      this.hasWorker = true;
    } else {
      this.hasWorker = true;
    }
  }

  public reset() {
    sessionStorage.removeItem('pwaStatus');
    const currentStatus = {
      isHttps: this.isHttps,
      hasManifest: this.hasManifest,
      hasWorker: this.hasWorker,
      hasBetterManifest: this.hasBetterManifest,
      hasBetterWorker: this.hasBetterWorker,
      hasBestManifest: this.hasBestManifest,
      hasBestWorker: this.hasBestWorker,
      hasNativeFeatures: this.hasNativeFeatures,
      isResponsive: this.isResponsive
    };

    this.statusState = currentStatus;
  }
}
</script>

<style lang="scss" scoped>
/* stylelint-disable */
@import "~assets/scss/base/variables";

#wrapper {
  padding-bottom: 48px;
  padding-left: 138px;
  padding-right: 138px;
  padding-top: 0;
}

.goodBetterBar {
  display: flex;
  justify-content: space-around;
  text-align: center;
  width: 100%;

  h3 {
    color: $color-button-primary-purple-variant;
    font-size: 32px;
    font-weight: 400;
  }
}

.choiceCol {
  width: 336px;
  height: 811px;

  li {
    font-family: "Bungee", cursive;
    font-size: 16px;
    line-height: 26px;
    margin: 0;
    margin-bottom: 10px;
    text-align: left;
    background-image: url("~/assets/images/gbbNotChecked.svg");
    background-size: 24px 24px;
    background-repeat: no-repeat;
    list-style: none;

    h3 {
      font-size: 16px;
      padding-left: 30px;
    }

    p {
      font-family: "Segoe UI";
      margin-right: 10px;
    }

    a {
      color: $color-brand-quintary;
      //background-image: url("~/assets/images/goButton.svg");
     // background-size: 240px 41px;
      background-repeat: no-repeat;
      display: block;
      width: 240px;
      line-height: 41px;
      text-align: center;
      margin-top: 10px;
    }
  }
}

.selectedBox {
  background-repeat: no-repeat;
}

.publish {
  display: inline-block;
}
.homeGood {
  .selectedBox {
    background-image: none;
  }

  .paramText {
    display: none;
  }

  .publish {
    display: none;
  }
}

#goodPWAHeaderBlock {
  width: 472px;
}

.choiceCol li.good {
 // background-image: url("~/assets/images/gbbChecked.svg");
}
</style>
