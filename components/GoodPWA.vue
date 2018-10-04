<template>
 <div id='wrapper'>

  <div id="goodBetterBar">
    <div class="choiceCol">
      <div class="rateContainer"><img id="good" class="rateBoxes" src="~/assets/images/good.svg"></div>
      <h3>{{ $t('home.quality_low_title') }}</h3>
      <ul>
        <li v-bind:class="{ good: statusState.isHttps || allGood }">{{ $t('home.quality_low_list_1') }}</li>
        <li v-bind:class="{ good: statusState.hasManifest || allGood }">{{ $t('home.quality_low_list_2') }}</li>
        <li v-bind:class="{ good: statusState.hasWorker || allGood }">{{ $t('home.quality_low_list_3') }}</li>
      </ul>
    </div>

    <div class="choiceCol">
      <div class="rateContainer"><img id="better" class="rateBoxes" src="~/assets/images/better.svg"></div>
      <h3>{{ $t('home.quality_mid_title') }}</h3>
      <ul>
        <li v-bind:class="{ good: statusState.hasBetterWorker || allGood }">{{ $t('home.quality_mid_list_1') }}</li>
        <li v-bind:class="{ good: statusState.hasBetterManifest || allGood }">{{ $t('home.quality_mid_list_2') }}</li>
      </ul>
    </div>

    <div class="choiceCol">
      <div class="rateContainer"><img id="best" class="rateBoxes" src="~/assets/images/best.svg"></div>
      <h3>{{ $t('home.quality_high_title') }}</h3>
      <ul>
        <li v-bind:class="{ good: statusState.hasNativeFeatures || allGood }">{{ $t('home.quality_high_list_1') }}</li>
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
  @Prop({}) isHttps: boolean;
  @Prop({}) hasManifest: boolean;
  @Prop({}) hasWorker: boolean;
  @Prop({}) hasBetterManifest: boolean;
  @Prop({}) hasBetterWorker: boolean;
  @Prop({}) hasBestManifest: boolean;
  @Prop({}) hasBestWorker: boolean;
  @Prop({}) hasNativeFeatures: boolean;
  @Prop({}) isResponsive: boolean;
  @Prop({}) allGood: boolean;

  statusState: any = {};

  public mounted() {
    this.updateStatusState();
  }

  public updated() {
    // const status = this.updateStatusState();
    sessionStorage.setItem('pwaStatus', JSON.stringify(status));
  }

  updateStatusState() {
    let savedStatus: string | object | any = sessionStorage.getItem('pwaStatus');
    if (savedStatus) {
      // our saved status
      savedStatus = JSON.parse(savedStatus);
    }

    const updatedStatus = { 
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

   /*this.statusState = {...updatedStatus, ...savedStatus};*/
   console.log(this.statusState);

   return updatedStatus;
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

#goodBetterBar {
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

  li {
    font-family: 'Bungee', cursive;
    font-size: 16px;
    line-height: 26px;
    margin: 0;
    margin-bottom: 10px;
    padding-left: 30px;
    text-align: left;
    background-image: url('~/assets/images/gbbChecked.svg');
    background-size: 24px 24px;
    background-repeat: no-repeat;
    list-style: none;
  }
}

#goodPWAHeaderBlock {
  width: 472px;
}

.good {
  color: $color-brand;
}
</style>