<template>
  <div id="mainDiv">
    <HubHeader
      showFeatureDetailButton="true"
      :showFeatureDetailGraphButton="onGraph"
    ></HubHeader>

    <ion-toast-controller></ion-toast-controller>

    <div v-if="onAuth" id="clientIdBlock">
      <button v-if="!idGenerated" @click="generateID()">
        Generate Client ID
      </button>
      <div id="generatedDiv" v-else @click="generateID()">ID Generated</div>
    </div>

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

  onAuth: boolean = false;
  onGraph: boolean = false;

  idGenerated: boolean = false;

  snippitMap = [
    {
      realName: "graphAuth",
      mappedName: "Login Graph Component",
      docsName: "login"
    },
    {
      realName: "graphContacts",
      mappedName: "People Graph Component",
      docsName: "people"
    },
    {
      realName: "graphCalendar",
      mappedName: "Agenda Graph Component",
      docsName: "agenda"
    },
    {
      realName: "graphCreateActivity",
      mappedName: "Activity Graph Component"
    },
    {
      realName: "share",
      mappedName: "Create Share"
    },
    {
      realName: "installButton",
      mappedName: "Install your PWA"
    },
    {
      realName: "authButton",
      mappedName: "Sign In with Microsoft, Google, Facebook"
    },
    {
      realName: "midi",
      mappedName: "Web MIDI"
    },
    {
      realName: "graphPeoplePicker",
      mappedName: "People Picker Graph Component",
      docsName: "people-picker"
    },
    {
      realName: "graphPerson",
      mappedName: "Person Graph Component",
      docsName: "person"
    },
    {
      realName: "graphTasks",
      mappedName: "Tasks Graph Component",
      docsName: "tasks"
    },

    {
      realName: "immersiveReader",
      mappedName: "Immersive Reader"
    }
  ];

  baseURL =
    "https://raw.githubusercontent.com/pwa-builder/pwabuilder-snippits/demo/src";

  baseGraphDocsURL =
    "https://docs.microsoft.com/en-us/graph/toolkit/components";

  docsContent: string | null = null;

  async mounted() {
    (<HTMLButtonElement>document.getElementById("backButton")).addEventListener(
      "click",
      this.goBack
    );
    (<HTMLButtonElement>(
      document.getElementById("featDetailShareButton")
    )).addEventListener("click", this.share);
    (<HTMLButtonElement>(
      document.getElementById("githubSnippitButton")
    )).addEventListener("click", this.goToGithub);
    this.$nextTick(function() {
      if (this.onGraph) {
        (<HTMLButtonElement>(
          document.getElementById("featDetailDocsButton")
        )).addEventListener("click", this.goToDocs);
      }
    });

    const overrideValues = {
      uri: window.location.href,
      pageName: this.$route.params.featureDetail,
      pageHeight: window.innerHeight
    };

    this.snippitMap.forEach(async snippit => {
      if (snippit.mappedName === this.$route.params.featureDetail) {
        this.currentSample = snippit;

        if (
          this.$route.params.featureDetail === "Microsoft Graph Authentication"
        ) {
          this.onAuth = true;
        } else {
          this.onAuth = false;
        }

        if (this.$route.params.featureDetail.toLowerCase().includes("graph")) {
          this.onGraph = true;
        } else {
          this.onGraph = false;
        }

        const response = await fetch(
          `${this.baseURL}/${snippit.realName}/${snippit.realName}.md`
        );
        const docsFile = await response.text();

        this.docsContent = marked(docsFile, {
          highlight: function(docsFile) {
            return require("highlight.js").highlightAuto(docsFile).value;
          }
        });
      }
    });

    this.$awa(overrideValues);
  }

  generateID() {
    const els = document.querySelectorAll(".hljs-string");

    for (let i = 0; i < els.length; i++) {
      if ((els[i] as any).textContent.toLowerCase().includes("client")) {
        els[i].textContent = '"a974dfa0-9f57-49b9-95db-90f04ce2111a"';
      }
    }

    setTimeout(() => {
      this.idGenerated = true;
    }, 700);
  }

  goToGithub() {
    window.open(
      `https://github.com/pwa-builder/pwabuilder-snippits/tree/demo/src/${this.currentSample.realName}/${this.currentSample.realName}.md`,
      "_blank"
    );
  }

  goToDocs() {
    window.open(
      `${this.baseGraphDocsURL}/${this.currentSample.docsName}`,
      "_blank"
    );
  }

  goBack() {
    if (document.referrer.indexOf(window.location.origin) === 0) {
      window.history.back();
    } else {
      // If the current document was not opened through a link (for example, user navigated to the page directly or through a bookmark)
      window.location.href = `${window.location.origin}/features`;
    }
  }

  async showToast() {
    const toastCtrl = document.querySelector("ion-toast-controller");
    await (toastCtrl as any).componentOnReady();

    const toast = await (toastCtrl as any).create({
      duration: 1300,
      message: "URL copied for sharing"
    });

    await toast.present();
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
        this.copyToClipboard(location.href);
        this.showToast();
      }
    }
  }

  copyToClipboard(str) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(str);
    } else if (document) {
      const el = document.createElement("textarea"); // Create a <textarea> element
      el.value = str; // Set its value to the string that you want copied
      el.setAttribute("readonly", ""); // Make it readonly to be tamper-proof
      el.style.position = "absolute";
      el.style.left = "-9999px"; // Move outside the screen to make it invisible
      document.body.appendChild(el); // Append the <textarea> element to the HTML document
      const selected =
        document.getSelection().rangeCount > 0 // Check if there is any content selected previously
          ? document.getSelection().getRangeAt(0) // Store selection if found
          : false; // Mark as false to know no selection existed before
      el.select(); // Select the <textarea> content
      document.execCommand("copy"); // Copy - only works as a result of a user action (e.g. click events)
      document.body.removeChild(el); // Remove the <textarea> element
      if (selected && document) {
        // If a selection existed before copying
        document.getSelection().removeAllRanges(); // Unselect everything on the HTML document
        document.getSelection().addRange(selected); // Restore the original selection
      }
    }
  }
}

Vue.prototype.$awa = function(config) {
  awa.ct.capturePageView(config);
  return;
};

declare var awa: any;
</script>

<style lang="scss">
/* stylelint-disable */
@import "~assets/scss/base/variables";
@import "~assets/scss/vendor/highlightjs2";

.featDetailButton {
  margin-left: 10px;
  background: transparent;
  border: solid 1px white;
  border-radius: 24px;
  width: 99px;
  height: 42px;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-self: center;
  align-items: center;
  color: white;

  span {
    margin-left: 10px;
  }
}

#clientIdBlock {
  position: absolute;
  left: 38.8%;
  top: 14.4em;
}

#clientIdBlock button {
  background: linear-gradient(
    270deg,
    rgb(36, 36, 36) 23.15%,
    rgb(60, 60, 60) 57.68%
  );
  color: white;
  font-family: sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 21px;
  border: none;
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 20px;
}

#clientIdBlock #generatedDiv {
  color: white;
  width: 150.33px;
  font-family: sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 21px;
  border: none;
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 20px;
  background: linear-gradient(to right, #1fc2c8, #9337d8 116%);
  display: flex;
  align-items: center;
  justify-content: center;
}

#docsMain #contentContainer img {
  // responsive images
  max-width: 100%;
  height: auto;
}

#docsMain #contentContainer table {
  display: block;
  width: 100%;
  overflow: auto;

  thead {
    box-sizing: border-box;

    th {
      text-align: center;
      font-size: 1.1em !important;
      font-weight: 600;
      padding: 10px;
    }
  }

  tr {
    background-color: white;
    border: 1px solid #dfe2e5;
    border-spacing: 0;
    border-collapse: collapse;
  }

  td {
    padding: 6px 13px;
    border: 1px solid #dfe2e5;
  }
}

.codeBlockHeader {
  background: #cececead;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 34px;
  padding-right: 20px;
  border-radius: 4px 4px 0px 0px;
}

.codeBlockHeader p {
  margin-left: 24px;
  font-weight: bold;
  font-size: 14px !important;
}

#docsMain #contentContainer p {
  font-size: 16px;
  line-height: 22px;
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
  white-space: pre-wrap;
}

.codeBlock pre {
  margin: 0;
}

#docsMain {
  background: white;
  margin-top: -80px;

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
      width: 55%;
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
    padding: 0px 24px 10px;
    border-radius: 0px 0px 4px 4px;
    margin-bottom: 2em;
  }

  #leftSide th {
    text-align: start;
  }

  #leftSide a {
    font-weight: bold;
    text-decoration: underline;
  }

  #contentContainer {
    display: flex;
    padding-left: 159px;
    padding-right: 159px;
    flex-direction: column-reverse;

    #leftSide {
      flex: 1;
      // width: 50%;
      margin-right: 20px;

      h3 {
        font-size: 24px;
        font-weight: bold;
        margin: 24px 0 16px 0;
      }

      h4 {
        font-size: 20px;
        font-weight: bold;
        margin: 24px 0 16px 0;
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
      display: initial;
      flex: 1;
      margin-top: 28px;

      h3 {
        font-size: 24px;
        font-weight: bold;
        margin: 24px 0 16px 0;
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

#featureDetailButtons {
  width: 100%;
  height: 80px;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  padding-right: 20px;
  padding-left: 20px;
}

#backButton {
  background: white;
  border-radius: 50%;
  border: none;
  font-size: 14px;
  height: 42px;
  width: 42px;
  align-self: center;
}

#featDetailTitle {
  flex-grow: 4;
}

@media (max-width: 800px) {
  #docsMain #headerDiv h2 {
    width: 45%;
  }
}

@media (max-width: 700px) {
  #docsMain #headerDiv h2 {
    width: 40%;
  }
}

@media (max-width: 650px) {
  #docsMain #contentContainer {
    padding-left: 25px;
    padding-right: 25px;
  }

  #docsMain #contentContainer #leftSide,
  #docsMain #contentContainer #rightSide {
    width: 100%;
    margin-right: 0px;
    margin-left: 0px;
  }
}

@media (max-width: 630px) {
  #docsMain #headerDiv h2 {
    display: none;
  }
}

@media (max-width: 420px) {
  #featureDetailButtons :nth-child(5) {
    display: none;
  }
}

@media (max-width: 300px) {
  #featDetailDocsButton {
    display: none;
  }
  #featDetailShareButton {
    display: none;
  }
}

div#rightSide::before {
    content: "Quick startup guide";
    font-size: 28px;
    font-weight: bold;
    margin: 28px 0px 16px 0;
}

div#leftSide::before {
    content: "Documentation";
    font-size: 28px;
    font-weight: bold;
    margin: 28px 0px 16px 0;
}
</style>
