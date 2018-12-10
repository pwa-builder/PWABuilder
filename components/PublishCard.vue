<template>
  <div class="card">
    <div class="cardInside">
      <h1 class="title">{{ this.platform }}</h1>
      <p class="description">{{ this.description }}</p>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Prop } from 'vue-property-decorator';

@Component({})
export default class extends Vue {
  @Prop({}) platform: string;
  @Prop({}) description: string;
}
</script>

<style lang="scss" scoped>
@import '~assets/scss/base/variables';

.card {
  box-shadow: 0 20px 40px 0 $color-brand-quintary, 0 14px 12px 0 $color-brand-quintary;
  margin: 69px;
}

.cardInside {
  border-radius: 5px;
  padding-bottom: 60px;
  padding-left: 40px;
  padding-right: 50px;
  padding-top: 137px;
}

.title {
  color: #8B8B8B;
  font-size: 40px;
  font-weight: normal;
}

.description {
  color: #0E0E0E;
}
</style>