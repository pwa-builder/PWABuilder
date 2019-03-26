<template>
  <div id="mainDiv">
    <HubHeader></HubHeader>

    <button @click="goBack()" id="backButton">
      <i class="fas fa-chevron-left"></i>
    </button>

    <button @click="share()" id="featDetailShareButton">
      <i class="fas fa-share"></i>
      <span>Share</span>
    </button>

    <main id="docsMain" v-html="docsContent"></main>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

import HubHeader from "~/components/HubHeader.vue";
import SnippitCode from "~/components/snippitCode.vue";

import * as windowsStore from "~/store/modules/windows";

import * as marked from "marked";
import Clipboard from "clipboard";

const WindowsState = namespace(windowsStore.name, State);
const WindowsAction = namespace(windowsStore.name, Action);

// const baseURL = "https://pwabuilder-docs.azurewebsites.net/?control";

@Component({
  components: {
    HubHeader,
    SnippitCode
  }
})
export default class extends Vue {
  @WindowsState sample: windowsStore.Sample;
  @WindowsState samples: windowsStore.Sample[];

  @WindowsAction getSamples;

  currentSample: any = null;

  codeSnippits: any = null;

  snippitMap = [
    {
      realName: "graphAuth",
      mappedName: "Create MSFT Graph Authentication"
    }
  ];

  baseURL =
    "https://raw.githubusercontent.com/pwa-builder/pwabuilder-snippits/master/src";

  docsContent: string | null = null;

  async mounted() {
    console.log(this.$route.params.featureDetail);

    this.snippitMap.forEach(async snippit => {
      if (snippit.mappedName === this.$route.params.featureDetail) {
        const response = await fetch(
          `${this.baseURL}/${snippit.realName}/${snippit.realName}.md`
        );
        const docsFile = await response.text();

        this.docsContent = marked(docsFile);
        console.log(docsFile);
      }
    });
    /*const response = await fetch(
      `${baseURL}=${this.$route.params.featureDetail}`
    );
    const data = await response.json();

    this.codeSnippits = data.snippets;

    console.log('codeSnippits', this.codeSnippits);

    await this.getSamples();
    console.log('this.samples', this.samples);

    this.samples.forEach(sample => {
      console.log(this.codeSnippits[0]);
      console.log("sample.image", sample.image);
      console.log('this.$route.params.featureDetail', this.$route.params.featureDetail);

      if (
        sample.image && sample.image.includes(this.$route.params.featureDetail) === true
      ) {
        console.log("inside finder", sample);
        this.currentSample = sample;
      }
    });*/
  }

  goBack() {
    window.history.back();
  }

  async share() {
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({
          title: "PWABuilder Feature",
          text: "Check out this cool feature you can add to your PWA",
          url: location.href
        });
      } catch (err) {
        console.error("trouble sharing with the web share api", err);
      }
    } else {
      if ((navigator as any).clipboard) {
        try {
          await (navigator as any).clipboard.writeText(location.href);
        } catch (err) {
          console.error(err);
        }
      } else {
        let clipboard = new Clipboard(location.href);

        clipboard.on("success", e => {
          console.info("Action:", e.action);
          console.info("Text:", e.text);
          console.info("Trigger:", e.trigger);
          e.clearSelection();
        });

        clipboard.on("error", e => {
          console.error("Action:", e.action);
          console.error("Trigger:", e.trigger);
        });
      }
    }
  }
}
</script>

<style lang="scss">
/* stylelint-disable */
@import "~assets/scss/base/variables";

#featDetailShareButton {
  background: white;
  border: none;
  border-radius: 24px;
  position: absolute;
  right: 11em;
  top: 5em;
  width: 99px;
  height: 42px;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  justify-content: center;

  span {
    margin-left: 10px;
  }
}

#docsMain {
  background: white;

  #headerDiv {
    background: #f0f0f0;
    height: 80px;
    display: flex;
    align-items: center;
    padding-left: 220px;

    h2 {
      font-weight: bold;
      font-size: 24px;
      margin-bottom: 0px;
    }
  }

  .codeBlock {
    overflow: auto;
    background: #f0f0f0;
    padding: 24px;
    height: 190px;
  }

  #leftSide th {
    text-align: start;
  }

  #leftSide > table > tbody > tr:nth-child(1) > td:nth-child(1),
  #leftSide > table > tbody > tr:nth-child(2) > td:nth-child(1) {
    font-size: 12px;
    font-weight: bold;
    width: 140px;
  }

  #leftSide > table > tbody > tr:nth-child(1) > td:nth-child(2),
  #leftSide > table > tbody > tr:nth-child(2) > td:nth-child(2) {
    font-size: 14px;
    font-weight: normal;
  }

  #contentContainer {
    display: flex;
    padding-top: 30px;
    padding-left: 159px;
    padding-right: 159px;

    #leftSide {
      flex: 1;
      width: 50%;
      margin-right: 20px;

      h3 {
        font-size: 18px;
        font-weight: bold;
      }

      p {
        font-size: 16px;
      }

      #required-properties {
        margin-bottom: 24px;
      }

      th {
        font-size: 12px;
        font-weight: normal;
      }
    }

    #rightSide {
      flex: 1;
      width: 50%;
      margin-left: 20px;

      h3 {
        font-size: 18px;
        font-weight: bold;
      }
    }
  }
}

#backButton {
  position: absolute;
  top: 5em;
  left: 11em;
  background: white;
  border-radius: 50%;
  border: none;
  font-size: 14px;
  height: 42px;
  width: 42px;
}
</style>
