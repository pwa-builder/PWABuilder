<template>
  <div v-if="sample" class="card">
    <h4>{{sample.title}}</h4>
    <p>{{ sample.description }}</p>

    <div id="featureCardActionsBlock">
      <button v-if="!selected" @click="onClickSample(sample)" id="featureCardAddButton">Add</button>
      <span v-if="selected" @click="onClickRemoveSample(sample)" id="featureCardRemoveButton">Remove</span>
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

  selected = false;

  mounted() {
    console.log("im here");
  }

  onClickSample(sample: windowsStore.Sample) {
    console.log(sample);
    this.selected = true;

    this.$emit('selected', sample);
  }

  onClickRemoveSample(sample: windowsStore.Sample) {
    console.log(sample);
    this.selected = false;

    this.$emit('removed', sample);
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
      background: $color-brand-warning;
    }
  }
}
</style>