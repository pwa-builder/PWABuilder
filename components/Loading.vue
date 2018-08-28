<template>
<section>
  <div class="loading" v-if="active"></div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue-property-decorator';
import Component from 'nuxt-class-component';

@Component({})
export default class extends Vue {
  @Prop({ type: Boolean, default: false })
  public active: boolean;
}
</script>

<style lang="scss" scoped>
@import "~assets/scss/base/variables";

// From: https://projects.lukehaas.me/css-loaders/
.loading {
  $size: 1.1em;

  animation: spin 1.3s linear infinite;
  border-color: $color-foreground-brighter transparent;
  border-radius: 50%;
  border-style: solid;
  border-width: .12em;
  height: $size;
  position: relative;
  top: .2em;
  width: $size;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
}
</style>