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
import GeneratorMenu from '~/components/GeneratorMenu';
import TwoWays from '~/components/TwoWays';

const ExampleAction = namespace('example', Action)
const ExampleState = namespace('example', State)

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
    this.select(4);
    console.log(this.selected)
  }
}
</script>
