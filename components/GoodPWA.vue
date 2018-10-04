<template>
 <div id='wrapper'>
  <div id="goodPWAHeaderBlock">
    <h2 id="quickBlockText">  {{ $t('home.what_makes_title') }}</h2>
    <p>{{ $t('home.what_makes_body') }}</p>
  </div>

  <div id="goodBetterBar">
    <div>
      <h3>{{ $t('home.quality_low_title') }}</h3>
      <ul>
        <li v-bind:class="{ good: statusState.isHttps }">{{ $t('home.quality_low_list_1') }}</li>
        <li v-bind:class="{ good: statusState.hasManifest }">{{ $t('home.quality_low_list_2') }}</li>
        <li v-bind:class="{ good: statusState.hasWorker }">{{ $t('home.quality_low_list_3') }}</li>
      </ul>
    </div>

    <div>
      <h3>{{ $t('home.quality_mid_title') }}</h3>
      <ul>
        <li v-bind:class="{ good: statusState.hasBetterWorker }">{{ $t('home.quality_mid_list_1') }}</li>
        <li v-bind:class="{ good: statusState.hasBetterManifest }">{{ $t('home.quality_mid_list_2') }}</li>
        <li v-bind:class="{ good: statusState.isResponsive }">{{ $t('home.quality_mid_list_3') }}</li>
      </ul>
    </div>

    <div>
      <h3>{{ $t('home.quality_high_title') }}</h3>
      <ul>
        <li>{{ $t('home.quality_high_list_1') }}</li>
        <li v-bind:class="{ good: statusState.hasBestManifest }">Uses a fully completed manifest</li>
        <li v-bind:class="{ good: statusState.hasBestWorker }">Uses Service Workers to enable offline use cases</li>
        <li v-bind:class="{ good: statusState.hasNativeFeatures }">Integrates with native features in the operating system</li>
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

    const updatedStatus =
     { 
       isHttps: this.isHttps,
       hasManifest: this.hasManifest,
       hasWorker: this.hasWorker,
       hasBetterManifest: this.hasBetterManifest,
       hasBetterWorker: this.hasBetterWorker,
       hasBestManifest: this.hasBestManifest,
       hasBestWorker: this.hasBestWorker,
       hasNativeFeatures: this.hasNativeFeatures,
       isResponsive: this.isResponsive
     }
    ;

   /*this.statusState = {...updatedStatus, ...savedStatus};*/
   console.log(this.statusState);

   return updatedStatus;
  }
}
</script>

<style lang="scss" scoped>
@import '~assets/scss/base/variables';

#wrapper {
  padding-bottom: 48px;
  padding-left: 68px;
  padding-right: 190px;
  padding-top: 64px;
}

#goodBetterBar {
  display: flex;
  justify-content: space-between;
}

#goodBetterBar h3 {
  font-family: $font-family-l3;
  font-size: 32px;
  font-weight: 400;
}

#goodPWAHeaderBlock {
  width: 472px;
}

.good {
  color: $color-brand;
}
</style>