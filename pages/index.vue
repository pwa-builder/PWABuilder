<template>
  <section>
    <TwoWays/>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'nuxt-class-component'
import TwoWays from '~/components/TwoWays'
@Component({
  components: {
    TwoWays
  }
})
export default class extends Vue {}
</script>
