<template>
  <div id="mainDiv">
    <HubHeader></HubHeader>

    <button @click="goBack()" id="backButton">
      <i class="fas fa-chevron-left"></i>
    </button>

    <button @click="share()" id="featDetailShareButton">
      <i class="fas fa-share-alt"></i>
      <span>Share</span>
    </button>

    <button @click="goToGithub()" id="githubSnippitButton">
      <i class="fab fa-github"></i>
      <span>Github</span>
    </button>

    <div v-if="shared" id="shareToast">URL copied for sharing</div>

    <main id="docsMain" v-html="docsContent"></main>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

import HubHeader from "~/components/HubHeader.vue";
import SnippitCode from "~/components/snippitCode.vue";

// import 'sharebutton';

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

  shared: boolean = false;

  snippitMap = [
    {
      realName: "graphAuth",
      mappedName: "Create MSFT Graph Authentication"
    },
    {
      realName: "graphContacts",
      mappedName: "Create MSFT Graph Contacts API"
    },
    {
      realName: "graphCalendar",
      mappedName: "Create MSFT Graph Calendar API"
    },
    {
      realName: "graphCreateActivity",
      mappedName: "Create MSFT Graph Activity API"
    }
  ];

  baseURL =
    "https://raw.githubusercontent.com/pwa-builder/pwabuilder-snippits/master/src";

  docsContent: string | null = null;

  async mounted() {
    console.log(this.$route.params.featureDetail);

    this.snippitMap.forEach(async snippit => {
      if (snippit.mappedName === this.$route.params.featureDetail) {
        this.currentSample = snippit;

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

  goToGithub() {
    window.open(
      `https://github.com/pwa-builder/pwabuilder-snippits/tree/master/src/${
        this.currentSample.realName
      }/${this.currentSample.realName}.md`,
      "_blank"
    );
  }

  goBack() {
    window.history.back();
  }

  showToast() {
    // show toast
    this.shared = true;

    setTimeout(() => {
      this.shared = false;
    }, 1200);
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

          this.showToast();
        } catch (err) {
          console.error(err);
        }
      } else {
        let clipboard = new Clipboard(location.href);

        clipboard.on("success", e => {
          console.info("Action:", e.action);
          console.info("Text:", e.text);
          console.info("Trigger:", e.trigger);

          this.showToast();

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

.codeBlockHeader {
  background: #e2e2e2;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 54px;
  padding-right: 20px;
}

#docsMain #contentContainer p {
  font-size: 16px;
  line-height: 22px;
}

#featDetailShareButton {
  background: transparent;
  border: solid 1px white;
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
  color: white;

  span {
    margin-left: 10px;
  }
}

#githubSnippitButton {
  border: solid 1px white;
  position: absolute;
  right: 19em;
  top: 5em;
  height: 42px;
  width: 99px;
  background: transparent;
  border-radius: 24px;
  font-size: 14px;
  font-weight: bold;
  color: white;

  span {
    margin-left: 10px;
  }
}

@media (max-width: 1336px) {
  #featDetailShareButton {
    right: 3em;
  }

  #githubSnippitButton {
    right: 11em;
  }
}

#shareToast {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: #3c3c3c;
  color: white;
  padding: 1em;
  font-size: 14px;
  font-weight: bold;
  border-radius: 4px;
  padding-left: 1.4em;
  padding-right: 1.4em;
  animation-name: fadein;
  animation-duration: 0.3s;
}

@keyframes fadein {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.codeBlock code {
  font-size: 13px;
}

#docsMain {
  background: white;

  #headerDiv {
    background: rgba(31, 194, 200, 1);
    background: -moz-linear-gradient(
      left,
      rgba(31, 194, 200, 1) 0%,
      rgba(147, 55, 216, 1) 100%
    );
    background: -webkit-gradient(
      left top,
      right top,
      color-stop(0%, rgba(31, 194, 200, 1)),
      color-stop(100%, rgba(147, 55, 216, 1))
    );
    background: -webkit-linear-gradient(
      left,
      rgba(31, 194, 200, 1) 0%,
      rgba(147, 55, 216, 1) 100%
    );
    background: -o-linear-gradient(
      left,
      rgba(31, 194, 200, 1) 0%,
      rgba(147, 55, 216, 1) 100%
    );
    background: -ms-linear-gradient(
      left,
      rgba(31, 194, 200, 1) 0%,
      rgba(147, 55, 216, 1) 100%
    );
    background: linear-gradient(
      to right,
      rgba(31, 194, 200, 1) 0%,
      rgba(147, 55, 216, 1) 100%
    );

    height: 80px;
    display: flex;
    align-items: center;
    padding-left: 163px;

    h2 {
      font-weight: bold;
      font-size: 24px;
      color: white;
      margin-bottom: 0px;
    }
  }

  @media (max-width: 1336px) {
    #headerDiv {
      padding-left: 88px;
      padding-right: 35px;
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

  @media (max-width: 1336px) {
    #contentContainer {
      padding-left: 35px;
      padding-right: 35px;
    }
  }
}

#backButton {
  position: absolute;
  top: 5em;
  left: 7em;
  background: white;
  border-radius: 50%;
  border: none;
  font-size: 14px;
  height: 42px;
  width: 42px;
}

@media (max-width: 1336px) {
  #backButton {
    left: 30px;
  }
}
</style>
