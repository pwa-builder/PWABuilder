<template>
<section class="generator_menu">
  <div class="how-body">
  <h1 id="howItWorks"> {{ $t('home.how_works_title') }}</h1>
  <p> {{ $t('home.how_works_body') }}</p>
  <p> {{ $t('home.how_works_body_2') }}</p>

  </div>
  <div class="how-illistration">
    <img class="how-diagram" src="~/assets/images/Diagram.svg" />
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
  color: $color-button-primary-purple-variant;
  display: flex;
  flex-direction: row;
  font-size: 16px;
  justify-content: space-between;
  line-height: 24px;
  padding: 0 138px 100px 138px;
  width: 100%;

  #howItWorks {
    font-size: 24px;
    margin-bottom: 18px;
  }

  .how-body {
    margin-top: 150px;
    width: 376px;
  }

  .how-diagram {
    width: 344px;
  }
}
</style>