<template>
  <div class="card">
    <div class="cardInside">
      <h1 class="title">{{ this.title }}</h1>
      <p class="description">{{ this.description }}</p>
      <button class="learnMoreButton">Learn More</button>
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

.card {
  box-shadow: 0 20px 40px 0 $color-secondary, 0 14px 12px 0 $color-secondary;
  margin: 69px;
}

.learnMoreButton {
  background: transparent;
  border: #979797 solid 2px;
  border-radius: 2px;
  color: $color-brand;
  height: 40px;
  width: 110px;
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
  font-size: 22px;
}

.description {
  color: #8B8B8B;
}
</style>