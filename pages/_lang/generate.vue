<template>
  <section>
    <GeneratorMenu first-link-path='generate'/>
    <div class="l-generator-step">
    </div>
    <TwoWays/>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

import GeneratorMenu from "~/components/GeneratorMenu";
import TwoWays from "~/components/TwoWays";

import * as generator from "~/store/modules/generator";

const GeneratorState = namespace(generator.name, State);
const GeneratorAction = namespace(generator.name, Action);

@Component({
  components: {
    TwoWays,
    GeneratorMenu
  }
})
export default class extends Vue {

  @GeneratorState manifest: generator.Manifest;

  public created(): void {
    if (!this.manifest) {
      this.$router.push({
        path: '/'
      });
    }
  }

  public skipCheckUrl(): void {
    
  }
}
</script>
