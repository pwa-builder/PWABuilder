<template>
  <div v-if="sample" class="card">
    <h4>{{sample.title}}</h4>
    <p>{{ sample.description }}</p>

    <div id="featureCardActionsBlock">
      <button
        v-if="!showRemoveButton || !selected"
        @click="onClickSample(sample)"
        id="featureCardAddButton"
      >Review</button>
      <span
        v-if="showRemoveButton && selected"
        @click="onClickRemoveSample(sample)"
        id="featureCardRemoveButton"
      >Remove</span>
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
  @Prop({}) showRemoveButton: boolean;

  selected = false;

  onClickSample(sample: windowsStore.Sample) {
    this.$emit("selected", sample);

    this.selected = true;
  }

  onClickRemoveSample(sample: windowsStore.Sample) {
    this.$emit("removed", sample);

    this.selected = false;
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
  border: solid grey 1px;

  h4 {
    font-size: 18px;
    font-weight: bold;
  }

  p {
    width: 277px;
    flex: 2;
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
      background: $color-brand-warning;
      color: white;
    }
  }
}
</style>