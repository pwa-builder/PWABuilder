<template>
  <section>
    <GeneratorMenu/>
    Publish
    <TwoWays/>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'nuxt-class-component'
import GeneratorMenu from '~/components/GeneratorMenu'
import TwoWays from '~/components/TwoWays'

@Component({
  components: {
    TwoWays,
    GeneratorMenu
  }
})
export default class extends Vue {}
</script>
