<template>
  <div v-if="sample" class="card">
    <h4>{{sample.title}}</h4>
    <p>{{ sample.description }}</p>

    <div id="featureCardActionsBlock">
      <button
        @click="onClickSample(sample)"
        id="featureCardAddButton"
      >View</button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";
import { Prop } from "vue-property-decorator";

import * as windowsStore from "~/store/modules/windows";

@Component({})
export default class extends Vue {
  @Prop({}) sample: windowsStore.Sample;

  onClickSample(sample: windowsStore.Sample) {
    this.$emit("selected", sample);
  }

  onClickRemoveSample(sample: windowsStore.Sample) {
    console.log('here');
    this.$emit("removed", sample);
  }
}
</script>

<style lang="scss" scoped>
/* stylelint-disable */
@import "~assets/scss/base/variables";

.card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: solid #C5C5C5 1px;
  background: white;

  h4 {
    font-size: 18px;
    font-weight: bold;
  }

  p {
    width: 277px;
    flex: 2;
    font-size: 14px;
    line-height: 20px;
  }

  #featureCardActionsBlock {
    #featureCardAddButton {
      border: none;
      border-radius: 20px;
      padding-top: 11px;
      padding-bottom: 11px;
      padding-left: 27px;
      padding-right: 27px;
      font-size: 18px;
      font-weight: bold;
      background: $color-button-primary-purple-variant;
      color: white;
    }

    #featureCardRemoveButton {
      border: none;
      border-radius: 20px;
      padding-top: 11px;
      padding-bottom: 11px;
      padding-left: 27px;
      padding-right: 27px;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      justify-content: center;
      width: 116px;
      background: $color-brand-secondary;
      color: white;
    }
  }
}
</style>