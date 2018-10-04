<template>
 <div id='wrapper'>

  <div id="goodBetterBar">
    <div class="choiceCol selectedBox">
      <div class="rateContainer"><img id="good" class="rateBoxes" src="~/assets/images/good.svg"></div>
      <h3>{{ $t('home.quality_low_title') }}</h3>
      <ul>
        <li v-bind:class="{ good: isHttps }">{{ $t('home.quality_low_list_1') }}</li>
        <li v-bind:class="{ good: hasManifest }">{{ $t('home.quality_low_list_2') }}</li>
        <li v-bind:class="{ good: hasWorker }">{{ $t('home.quality_low_list_3') }}</li>
      </ul>
    </div>

    <div class="choiceCol">
      <div class="rateContainer"><img id="better" class="rateBoxes" src="~/assets/images/better.svg"></div>
      <h3>{{ $t('home.quality_mid_title') }}</h3>
      <ul>
        <li v-bind:class="{ good: hasBetterWorker }">{{ $t('home.quality_mid_list_1') }}</li>
        <li v-bind:class="{ good: hasBetterManifest }">{{ $t('home.quality_mid_list_2') }}</li>
      </ul>
    </div>

    <div class="choiceCol">
      <div class="rateContainer"><img id="best" class="rateBoxes" src="~/assets/images/best.svg"></div>
      <h3>{{ $t('home.quality_high_title') }}</h3>
      <ul>
        <li v-bind:class="{ good: hasNativeFeatures }">{{ $t('home.quality_high_list_1') }}</li>
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
  height: 911px;

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

  .selectedBox {
    background-image: url('~/assets/images/slectedBox.svg');
    background-repeat: no-repeat;
    background-size: contain;
  }

#goodPWAHeaderBlock {
  width: 472px;
}

.good {
  color: $color-brand;
}
</style>