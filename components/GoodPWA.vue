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
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Prop } from 'vue-property-decorator';

@Component({})
export default class extends Vue {
  @Prop({}) title: string;
  @Prop({}) description: string;
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
</style>