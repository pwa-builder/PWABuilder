<template>
  <div v-if="sample" class="card">
    <div class="featureCardTitleBlock">
      <h4>{{sample.name}}</h4>

      <slot name="iconSlot"></slot>
    </div>

    <p v-bind:class="{textWrap: wrapText}">{{ sample.desc }}</p>

    <div v-if="showAddButton" class="featureCardActionsBlock">
      <nuxt-link class="featureCardAddButton" v-bind:to="`https://components.pwabuilder.com/component/${sample.ID}`">
        View Feature
      </nuxt-link>
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
  @Prop({}) showAddButton;
  @Prop({ default: false }) wrapText;

  onClickSample(sample: windowsStore.Sample) {
    this.$emit("selected", sample);
  }

  onClickRemoveSample(sample: windowsStore.Sample) {
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
  background: white;
  border-radius: 4px;

  h4 {
    font-size: 14px;
    font-weight: bold;
    width: 80%;
  }

  @media (max-width: 1336px) {
    h4 {
      width: 16em;
    }
  }

  .featureCardTitleBlock {
    display: flex;
    justify-content: space-between;
  }

  .featureCardTitleBlock svg {
    color: #C5C5C5;
    font-size: 24px;
  }

  p {
    flex: 1;
    font-size: 14px;
    line-height: 20px;
    overflow: hidden;
  }

  .textWrap {
    white-space: initial !important;
  }

  .featureCardActionsBlock {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 1em;
  }

  .featureCardActionsBlock {
    .featureCardAddButton {
      border: none;
      border-radius: 20px;
      height: 2em;
      width: 10em;

      display: flex;
      justify-content: center;
      align-items: center;

      color: #9337d8;
      background-color: white;
      border: none;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 20px;
      text-transform: uppercase;

      transition: background-color 0.4s;
    }

    .featureCardAddButton:hover {
      background-color: #9337d8;
      color: white;
      width: 10em;
      height: 2em;
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
