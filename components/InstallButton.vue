<template>
  <button
    @click="install()"
    v-if="this.$route.path !== '/' && this.installPrompt !== null"
    id="installButton"
  >Install PWABuilder</button>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";

@Component({})
export default class extends Vue {
  installPrompt: any = null;

  public mounted() {
    console.log("install button mounted", (window as any).installEvent);
    if ((window as any).installEvent) {
      console.log("setting prompt");
      this.installPrompt = (window as any).installPrompt;
    }

    window.addEventListener("beforeinstallprompt", e => {
      console.log("got install prompt");
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      (window as any).installEvent = e;
    });
  }

  install() {
    if ((window as any).installEvent) {
      (window as any).installEvent.prompt();

      console.log((window as any).installEvent);
      (window as any).installEvent.userChoice.then(choiceResult => {
        if (choiceResult.outcome === "accepted") {
          console.log("Your PWA has been installed");
        } else {
          console.log("User chose to not install your PWA");
        }

        (window as any).installEvent = null;
      });
    }
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