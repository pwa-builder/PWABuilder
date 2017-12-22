<template>
<section>
    <div class="loading" v-if="active" :class="'loading-' + size"></div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue-property-decorator';
import Component from 'nuxt-class-component';

@Component()
export default class extends Vue {
  @Prop({ type: Boolean, default: false })
  public active: boolean;

  @Prop({ type: String, default: 'md' })
  public size: string;
}
</script>

<style lang="scss" scoped>
@import "~assets/scss/base/variables";

// From: https://projects.lukehaas.me/css-loaders/
.loading {
  animation: spin 1.3s linear infinite;
  border-color: $color-foreground-brighter transparent;
  border-radius: 50%;
  border-style: solid;
  position: relative;

  &-sm {
    border-width: .15rem;
    height: .8rem;
    width: .8rem;
  }

  &-md {
    border-width: .2rem;
    height: 1.5rem;
    top: .2rem;
    width: 1.5rem;
  }

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