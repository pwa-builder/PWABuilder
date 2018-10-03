<template>
<section class="generator_menu">
  <div class="how-body">
  <h1 id="howItWorks"> {{ $t('home.how_works_title') }}</h1>
  <p> {{ $t('home.how_works_body') }}</p>
  </div>
  <div class="how-illistration">
  </div>

</section>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Prop } from 'vue-property-decorator';

@Component({})
export default class extends Vue {
  public readonly activeClass = 'is-active';

  @Prop({ type: Boolean, default: false })
  public readonly firstLinkPath: boolean;
}
</script>

<style lang='scss' scoped>

@import '~assets/scss/base/variables';

.generator_menu {
  color: $color-brand-primary;
  font-size: 16px;
  line-height: 24px;
  margin: 134px 0 100px 138px;
  $tab-color-off: $color-brand-brighter;
  $tab-color-on: $color-brand;
  $tab-size: 16rem;
  $tab-height: 5rem;

  width: 376px;

  #howItWorks {
    font-size: 24px;
    margin-bottom: 18px;
  }
}
</style>