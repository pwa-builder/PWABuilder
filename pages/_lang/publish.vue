<template>
  <section>
    <GeneratorMenu/>
    {{ $t('publish.title') }}
    <TwoWays/>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Action, State, namespace } from 'vuex-class';

import { modules } from '~/store';
import GeneratorMenu from '~/components/GeneratorMenu';
import TwoWays from '~/components/TwoWays';

const ExampleAction = namespace(modules.example.name, Action)
const ExampleState = namespace(modules.example.name, State)

@Component({
  components: {
    TwoWays,
    GeneratorMenu
  }
})
export default class extends Vue {
  @ExampleAction select;
  @ExampleState selected: number

  created () {
    console.log(this.selected)
    this.select(Date.now());
    console.log(this.selected)
  }
}
</script>
