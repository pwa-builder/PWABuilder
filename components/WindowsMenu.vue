<template>
<section class="">
  <header class="generator_menu-header">
    {{ $t('windowsmenu.title') }}
  </header>
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

<style lang="scss" scoped>
@import "~assets/scss/base/variables";

/* stylelint-disable */

</style>