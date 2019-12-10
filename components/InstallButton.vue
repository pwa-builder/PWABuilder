<template>
  <div>
    <button
      @click="install()"
      v-if="this.$route.path !== '/'"
      id="installButton"
    >
      Install PWABuilder
    </button>

    <pwa-install usecustom manifestpath="/manifest.webmanifest"></pwa-install>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";

@Component({})
export default class extends Vue {
  install() {
    const pwaInstall: any = this.$el.querySelector(
      "pwa-install"
    ) as HTMLElement;
    console.log();

    pwaInstall.openPrompt();
  }
}
</script>

<style lang="scss" scoped>
#installButton {
  background: #3c3c3c;
  color: white;
  border-radius: 16px;
  border: none;
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  text-align: center;
  width: 162px;
  height: 32px;
  margin-right: 20px;
}

@media (max-width: 425px) {
  #installButton {
    display: none;
  }
}
</style>
