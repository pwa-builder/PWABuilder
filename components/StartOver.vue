<template>
<div class="start_over">
  <button @click="reset(); $ga.event('item', 'click', 'generator-startover-trigger')" class="pwa-button pwa-button--simple">
    {{ $t('publish.start_over') }}
  </button>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Action, namespace } from 'vuex-class';
import Component from 'nuxt-class-component';

import * as publish from '~/store/modules/publish';

const PublishAction = namespace(publish.name, Action);

@Component()
export default class extends Vue {
  @PublishAction resetAppData;

  public reset(): void {
    this.resetAppData();
    this.$router.push({
        name: 'index'
    });
  }
}
</script>

<style lang="scss" scoped>
@import '~assets/scss/base/variables';

.start_over {
  background-color: $color-foreground-brighter;
  display: block;
  padding: 2rem;
  text-align: center;
}
</style>