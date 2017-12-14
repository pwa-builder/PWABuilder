<template>
  <section>
    <GeneratorMenu/>


    <div class="step">
      <div class="l-generator-buttons l-generator-buttons--centered">
          <button @click="reset" class="pwa-button pwa-button--simple">{{ $t('publish.start_over') }}</button>
      </div>
    </div>


    <div class="l-generator-buttons l-generator-buttons--centered">
      <p class="instructions">{{ $t('publish.manifest_needed') }}</p>
      <button @click="goToHome" class="pwa-button pwa-button--simple">{{ $t('publish.first_step') }}</button>
    </div>
    <TwoWays/>
  </section>
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Action, State, namespace } from 'vuex-class';

import { modules } from '~/store';
import GeneratorMenu from '~/components/GeneratorMenu';
import TwoWays from '~/components/TwoWays';

import * as publish from '~/store/modules/publish';

const PublishAction = namespace(publish.name, Action);

@Component({
  components: {
    TwoWays,
    GeneratorMenu
  }
})
export default class extends Vue {

  @PublishAction resetAppData;

  public goToHome(): void {
    this.$router.push({
      name: 'index'
    });
  }

  public reset(): void {
    this.resetAppData();
    this.$router.push({
      name: 'index'
    });
  }
}
</script>
