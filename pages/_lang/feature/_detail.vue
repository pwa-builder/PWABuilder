<template>
  <div id="mainDiv">
    <HubHeader></HubHeader>

    <div v-if="onAuth" id="clientIdBlock">
      <button v-if="!idGenerated" @click="generateID()">Generate Client ID</button>
      <div id="generatedDiv" v-else @click="generateID()">ID Generated</div>
    </div>

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

  idGenerated: boolean = false;

  snippitMap = [
    {
      realName: "graphAuth",
      mappedName: "Microsoft Graph Authentication"
    },
    {
      realName: "graphContacts",
      mappedName: "Microsoft Graph Contacts API"
    },
    {
      realName: "graphCalendar",
      mappedName: "Microsoft Graph Calendar API"
    },
    {
      realName: "graphCreateActivity",
      mappedName: "Microsoft Graph Activity API"
    },
    {
      realName: "share",
      mappedName: "Create Share"
    },
    {
      realName: "geolocation",
      mappedName: "Use Geolocation"
    },
    {
      realName: "clipboard",
      mappedName: "Copy to Clipboard"
    },
    {
      realName: "installButton",
      mappedName: "Install your PWA"
    },
    {
      realName: "midi",
      mappedName: "Web MIDI"
    },
    {
      realName: "graphPeoplePicker",
      mappedName: "Pick the right people with the Microsoft Graph"
    },
    {
      realName: "graphPerson",
      mappedName: "Visualize people from the Microsoft Graph"
    },
    {
      realName: "graphTasks",
      mappedName: "Manage tasks through the Microsoft Graph"
    }
  ];

  baseURL =
    "https://raw.githubusercontent.com/pwa-builder/pwabuilder-snippits/demo/src";

  docsContent: string | null = null;

  async mounted() {
    console.log("route param", this.$route.params.featureDetail);

    this.snippitMap.forEach(async snippit => {
      console.log("snippit.mappedName", snippit.mappedName);
      if (snippit.mappedName === this.$route.params.featureDetail) {
        this.currentSample = snippit;

        console.log("feature detail", this.$route.params.featureDetail);

        // temporary for demo
        if (
          this.$route.params.featureDetail === "Microsoft Graph Authentication"
        ) {
          this.onAuth = true;
        } else {
          this.onAuth = false;
        }

        console.log(snippit);

        const response = await fetch(
          `${this.baseURL}/${snippit.realName}/${snippit.realName}.md`
        );
        const docsFile = await response.text();

        this.docsContent = marked(docsFile, {
          highlight: function(docsFile) {
            return require("highlight.js").highlightAuto(docsFile).value;
          }
        });
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

  generateID() {
    const els = document.querySelectorAll(".hljs-string");

    for (let i = 0; i < els.length; i++) {
      if ((els[i] as any).textContent.toLowerCase().includes("client")) {
        els[i].textContent = '"asdfasdfj23"';
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
        this.copyToClipboard(location.href);
        this.showToast();
      }
    }
  }

  copyToClipboard(str) {
    if (document) {
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
</script>

<style lang="scss">
/* stylelint-disable */
@import "~assets/scss/base/variables";
@import "~assets/scss/vendor/highlightjs2";

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
  font-family: Poppins;
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
  font-family: Poppins;
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
  width: 100%;
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

#featDetailShareButton {
  background: transparent;
  border: solid 1px white;
  border-radius: 24px;
  position: absolute;
  right: 12.4em;
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
  right: 21em;
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
  white-space: pre-wrap;
}

.codeBlock pre {
  margin: 0;
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
    min-height: 100vh;

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

@media (max-width: 425px) {
  #docsMain #contentContainer {
    flex-direction: column;
    padding-left: 25px;
    padding-right: 25px;
  }

  #docsMain #contentContainer #leftSide,
  #docsMain #contentContainer #rightSide {
    width: 100%;
    margin-right: 0px;
    margin-left: 0px;
  }

  #docsMain #headerDiv h2 {
    display: none;
  }

  #docsMain #contentContainer #rightSide {
    margin-top: 4em;
  }
}
</style>
