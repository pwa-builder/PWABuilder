<template>
<div @click="onClick()">
  <slot/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue-property-decorator';
import Component from 'nuxt-class-component';

@Component({})
export default class extends Vue {
  @Prop({ type: String, default: null })
  public anchor: string;

  public onClick(): void {
    this.scrollTo();
  }

  private scrollTo(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const $anchor = document.querySelector(this.anchor);
    const $html = document.querySelector('html');

    if (!$anchor || !$html) {
      return;
    }

    const rect = $anchor.getBoundingClientRect();
    $html.scrollTop = rect.top;
  }
}
</script>