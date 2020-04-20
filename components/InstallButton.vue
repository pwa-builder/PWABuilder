<template>
  <div v-if="this.$route.path !== '/'">
    <button
      @click="install()"
      id="installButton"
    >
    </button>

    <pwa-install usecustom manifestpath="/manifest.webmanifest">
      
    </pwa-install>
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
  font-family: sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  text-align: center;
  width: 162px;
  height: 32px;
  margin-right: 20px;
}

#installButton::after {
  content: 'Install PWABuilder';
}

@media (max-width: 820px) {
  #installButton::after {
    content: 'Install';
  }

  #installButton {
      padding-left: 10px;
      padding-right: 10px;
      width: auto;
  }
}

@media (max-width: 560px) {
  #installButton::after {
    content: '';
  }

  #installButton {
      width: 16px;
      height: 16px;
      padding-left: initial;
      padding-right: initial;
      background-image: url('~/assets/images/downloadicon.png');
      background-size: 70%;
      background-repeat: no-repeat;
      background-position: center;
      position: fixed;
      bottom: 10px;
      right: 5px;
      margin-right: 0px;
  }
}

</style>
