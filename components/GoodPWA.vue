<template>
 <div id='wrapper'>

  <div class="goodBetterBar">
    <div v-if="statusState" class="choiceCol selectedBox">
      <div class="rateContainer"><img id="good" class="rateBoxes" src="~/assets/images/good.svg"></div>
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
    </div>

    <div v-if="statusState" class="choiceCol">
      <div class="rateContainer"><img id="better" class="rateBoxes" src="~/assets/images/better.svg"></div>
      <h3>{{ $t('home.quality_mid_title') }}</h3>
      <ul>
        <li v-bind:class="{ good: statusState.hasBetterWorker || allGood }">
          <h3>{{ $t('home.quality_mid_list_1') }}</h3>
          <p class='paramText'>Your Service worker should manage traffic for offline funcatinality and app like performance.
           <nuxt-link to"/serviceworker">
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

    <div v-if="statusState" class="choiceCol">
      <div class="rateContainer"><img id="best" class="rateBoxes" src="~/assets/images/best.svg"></div>
      <h3>{{ $t('home.quality_high_title') }}</h3>
      <ul>
        <li v-bind:class="{ good: statusState.hasNativeFeatures || allGood }">
          <h3>{{ $t('home.quality_high_list_1') }}</h3>
          <p class='paramText'>The Best PWAs can replace native apps.  Add app like functionality for the best PWA experience. 
           <nuxt-link to="">
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

@Component({})
export default class extends Vue {
  @Prop({ default: true }) isHttps: boolean;
  @Prop({}) hasManifest: boolean;
  @Prop({}) hasWorker: boolean;
  @Prop({}) hasBetterManifest: boolean;
  @Prop({}) hasBetterWorker: boolean;
  @Prop({}) hasBestManifest: boolean;
  @Prop({}) hasBestWorker: boolean;
  @Prop({}) hasNativeFeatures: boolean;
  @Prop({}) isResponsive: boolean;
  @Prop({}) allGood: boolean;
  @Prop({}) allGoodWithText: boolean;

  statusState: any = null;

  public mounted() {

    // trying to grab the previous saved state
    // this will be null if not found
    const savedStatus = localStorage.getItem('pwaStatus');

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

    if (savedStatus !== null) {
      // if we have saved state lets merge that
      // and our current state based off our current props
      // and finally save it and set it as the state
      localStorage.setItem('pwaStatus', JSON.stringify({...currentStatus, ...JSON.parse(savedStatus)}));
      this.statusState = {...currentStatus, ...JSON.parse(savedStatus)}
    } else {
      // if we dont have any saved state
      // lets save our current state and then just display it
      localStorage.setItem('pwaStatus', JSON.stringify(currentStatus));
      this.statusState = currentStatus;
    }
  }
}
</script>

<style lang="scss" scoped>
/* stylelint-disable */
@import '~assets/scss/base/variables';

#wrapper {
  padding-bottom: 48px;
  padding-left: 138px;
  padding-right: 138px;
  padding-top: 0;
}

.rateBoxes {
  width: 154px;
}

.rateContainer{
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 165px;
  justify-content: flex-end;
}

.goodBetterBar {
  display: flex;
  justify-content: space-evenly;
  text-align: center;
  width: 100%;

  h3 {
    color: $color-brand-primary;
    font-size: 32px;
    font-weight: 400;
  }
}

.choiceCol {
  width: 376px;
  height: 911px;

  li {
    font-family: 'Bungee', cursive;
    font-size: 16px;
    line-height: 26px;
    margin: 0;
    margin-bottom: 10px;
    text-align: left;
    background-image: url('~/assets/images/gbbNotChecked.svg');
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
      background-image: url('~/assets/images/goButton.svg');
      background-size: 240px 41px;
      background-repeat: no-repeat;
      display: inline-block;
      width: 240px;
      line-height: 41px;
      text-align: center;
      margin-top: 10px;
    }
  }

}

  .selectedBox {
    background-image: url('~/assets/images/slectedBox.svg');
    background-repeat: no-repeat;
    background-size: 345px;
  }
  .homeGood {

    .selectedBox {
    background-image: none;
    }
  }

#goodPWAHeaderBlock {
  width: 472px;
}

.choiceCol li.good {
background-image: url('~/assets/images/gbbChecked.svg');
}
</style>