<template>
  <main id="pushMain">
    <HubHeader></HubHeader>

    <div id="pushContentContainer">
      <pwab-push></pwab-push>
    </div>
  </main>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";

import HubHeader from "~/components/HubHeader.vue";

@Component({
  components: {
    HubHeader
  }
})
export default class extends Vue {}
</script>

<style scoped>
  #pushContentContainer {
    padding-left: 3%;
    padding-right: 3%;
  }
</style>
