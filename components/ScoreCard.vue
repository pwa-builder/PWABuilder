<template>
  <div id="scoreCard">
    <div id="headerDiv">
      <h3>{{category}}</h3>

      <div v-if="category === 'Manifest'" class="cardScore">
        <span class="subScore">{{Math.round(manifestScore)}}</span> / 40
      </div>

      <div v-else-if="category === 'Service Worker'" class="cardScore">
        <span class="subScore">{{swScore}}</span> / 40
      </div>

      <div v-else-if="category === 'Security'" class="cardScore">
        <span class="subScore">{{Math.round(securityScore)}}</span> / 20
      </div>
    </div>

    <div id="cardContent">
      <!-- Security section -->
      <ul v-if="category === 'Security'">
        <li v-bind:class="{ good: hasHTTPS }">
          <div>
            <span class="cardIcon" v-if="hasHTTPS">
              <i class="fas fa-check"></i>
            </span>

            <span class="cardIcon" v-else>
              <i class="fas fa-times"></i>
            </span>

            <span>Uses HTTPS URL</span>
          </div>

          <span class="subScoreSpan" v-if="hasHTTPS">10</span>

          <span class="subScoreSpan" v-else-if="!hasHTTPS">0</span>
        </li>
        <li v-bind:class="{ good: validSSL }">
          <div>
            <span class="cardIcon" v-if="validSSL">
              <i class="fas fa-check"></i>
            </span>
            <span class="cardIcon" v-else-if="!validSSL">
              <i class="fas fa-times"></i>
            </span>

            <span>Valid SSL certificate is use</span>
          </div>

          <span class="subScoreSpan" v-if="validSSL">5</span>

          <span class="subScoreSpan" v-else-if="!validSSL">0</span>
        </li>
        <li v-bind:class="{ good: noMixedContent }">
          <div>
            <span class="cardIcon" v-if="noMixedContent">
              <i class="fas fa-check"></i>
            </span>

            <span class="cardIcon" v-else>
              <i class="fas fa-times"></i>
            </span>

            <span>No "mixed" content on page</span>
          </div>

          <span class="subScoreSpan" v-if="noMixedContent">5</span>

          <span class="subScoreSpan" v-else-if="!noMixedContent">0</span>
        </li>
      </ul>

      <!-- Manifest section -->
      <ul v-if="category === 'Manifest' && manifest && !noManifest">
        <li v-bind:class="{ good: manifest }">
          <div class="listSubDiv">
            <span class="cardIcon" v-if="manifest">
              <i class="fas fa-check"></i>
            </span>
            <span class="cardIcon" v-if="!manifest">
              <i class="fas fa-times"></i>
            </span>

            <span>Web Manifest properly attached</span>
          </div>

          <span class="subScoreSpan" v-if="manifest">15</span>

          <span class="subScoreSpan" v-else-if="!manifest">0</span>
        </li>
        <li v-bind:class="{ good: manifest && manifest.display }">
          <div class="listSubDiv">
            <span class="cardIcon" v-if="manifest && manifest.display">
              <i class="fas fa-check"></i>
            </span>
            <span class="cardIcon" v-if="manifest && !manifest.display">
              <i class="fas fa-times"></i>
            </span>

            <span>
              <code>display</code> property utilized
            </span>
          </div>

          <span class="subScoreSpan" v-if="manifest.display">5</span>

          <span class="subScoreSpan" v-else-if="!manifest.display">0</span>
        </li>
        <li v-bind:class="{ good: manifest && manifest.icons }">
          <div class="listSubDiv">
            <span class="cardIcon" v-if="manifest && manifest.icons">
              <i class="fas fa-check"></i>
            </span>
            <span class="cardIcon" v-if="manifest && !manifest.icons">
              <i class="fas fa-times"></i>
            </span>

            <span>
              Lists
              <code>icons</code> for add to home screen
            </span>
          </div>

          <span class="subScoreSpan" v-if="manifest.icons">5</span>

          <span class="subScoreSpan" v-else-if="!manifest.icons">0</span>
        </li>
        <li v-bind:class="{ good: manifest && manifest.name }">
          <div class="listSubDiv">
            <span class="cardIcon" v-if="manifest && manifest.name">
              <i class="fas fa-check"></i>
            </span>
            <span class="cardIcon" v-if="manifest && !manifest.name">
              <i class="fas fa-times"></i>
            </span>

            <span>
              Contains
              <code>name</code> property
            </span>
          </div>

          <span class="subScoreSpan" v-if="manifest.name">5</span>

          <span class="subScoreSpan" v-else-if="!manifest.name">0</span>
        </li>
        <li v-bind:class="{ good: manifest && manifest.short_name }">
          <div class="listSubDiv">
            <span class="cardIcon" v-if="manifest && manifest.short_name">
              <i class="fas fa-check"></i>
            </span>
            <span class="cardIcon" v-if="manifest && !manifest.short_name">
              <i class="fas fa-times"></i>
            </span>

            <span>
              Contains
              <code>short_name</code> property
            </span>
          </div>

          <span class="subScoreSpan" v-if="manifest.short_name">5</span>

          <span class="subScoreSpan" v-else-if="!manifest.short_name">0</span>
        </li>

        <li v-bind:class="{ good: manifest && manifest.start_url }">
          <div class="listSubDiv">
            <span class="cardIcon" v-if="manifest && manifest.start_url">
              <i class="fas fa-check"></i>
            </span>
            <span class="cardIcon" v-if="manifest && !manifest.start_url">
              <i class="fas fa-times"></i>
            </span>

            <span>
              Designates a
              <code>start_url</code>
            </span>
          </div>

          <span class="subScoreSpan" v-if="manifest.start_url">5</span>

          <span class="subScoreSpan" v-else-if="!manifest.start_url">0</span>
        </li>
      </ul>

      <ul v-if="category === 'Manifest' && !manifest && !noManifest">
        <li>
          <span class="skeletonSpan"></span>
        </li>
        <li>
          <span class="skeletonSpan"></span>
        </li>
        <li>
          <span class="skeletonSpan"></span>
        </li>
        <li>
          <span class="skeletonSpan"></span>
        </li>
      </ul>

      <ul id="noSWP" v-if="category === 'Manifest' && noManifest">
        <li>
          <div class="listSubDiv">
            <span class="cardIcon">
              <i class="fas fa-times"></i>
            </span>

            <span>Web Manifest properly attached</span>
          </div>

          <span class="subScoreSpan">0</span>
        </li>
        <li>
          <div class="listSubDiv">
            <span class="cardIcon">
              <i class="fas fa-times"></i>
            </span>

            <span>
              <code>display</code> property utilized
            </span>
          </div>

          <span class="subScoreSpan">0</span>
        </li>
        <li>
          <div class="listSubDiv">
            <span class="cardIcon">
              <i class="fas fa-times"></i>
            </span>

            <span>
              Lists
              <code>icons</code> for add to home screen
            </span>
          </div>

          <span class="subScoreSpan">0</span>
        </li>
        <li>
          <div class="listSubDiv">
            <span class="cardIcon">
              <i class="fas fa-times"></i>
            </span>

            <span>
              Contains
              <code>name</code> property
            </span>
          </div>

          <span class="subScoreSpan">0</span>
        </li>
        <li>
          <div class="listSubDiv">
            <span class="cardIcon">
              <i class="fas fa-times"></i>
            </span>

            <span>
              Contains
              <code>short_name</code> property
            </span>
          </div>

          <span class="subScoreSpan">0</span>
        </li>
        <li>
          <div class="listSubDiv">
            <span class="cardIcon">
              <i class="fas fa-times"></i>
            </span>

            <span>
              Designates a
              <code>start_url</code>
            </span>
          </div>

          <span class="subScoreSpan">0</span>
        </li>
      </ul>

      <!-- service worker section -->
      <ul v-if="category === 'Service Worker' && serviceWorkerData">
        <li v-bind:class="{ good: serviceWorkerData.hasSW }">
          <div class="listSubDiv">
            <span class="cardIcon" v-if="serviceWorkerData && serviceWorkerData.hasSW">
              <i class="fas fa-check"></i>
            </span>
            <span class="cardIcon" v-if="serviceWorkerData && !serviceWorkerData.hasSW">
              <i class="fas fa-times"></i>
            </span>

            <span>Has a Service Worker</span>
          </div>

          <span class="subScoreSpan" v-if="serviceWorkerData && serviceWorkerData.hasSW">20</span>

          <span class="subScoreSpan" v-if="!serviceWorkerData && !serviceWorkerData.hasSW">0</span>
        </li>
        <li v-bind:class="{ good: serviceWorkerData.cache }">
          <div class="listSubDiv">
            <span class="cardIcon" v-if="serviceWorkerData && serviceWorkerData.cache">
              <i class="fas fa-check"></i>
            </span>
            <span class="cardIcon" v-if="serviceWorkerData && !serviceWorkerData.cache">
              <i class="fas fa-times"></i>
            </span>

            <span>Service Worker has cache handlers</span>
          </div>

          <span class="subScoreSpan" v-if="serviceWorkerData && serviceWorkerData.cache">10</span>

          <span class="subScoreSpan" v-if="!serviceWorkerData && !serviceWorkerData.cache">0</span>
        </li>
        <li v-bind:class="{ good: serviceWorkerData.scope }">
          <div class="listSubDiv">
            <span class="cardIcon" v-if="serviceWorkerData && serviceWorkerData.scope">
              <i class="fas fa-check"></i>
            </span>
            <span class="cardIcon" v-if="serviceWorkerData && !serviceWorkerData.scope">
              <i class="fas fa-times"></i>
            </span>

            <span>
              Service Worker has the correct
              <code>scope</code>
            </span>
          </div>

          <span class="subScoreSpan" v-if="serviceWorkerData && serviceWorkerData.scope">5</span>

          <span class="subScoreSpan" v-if="!serviceWorkerData && !serviceWorkerData.scope">0</span>
        </li>
        <li v-bind:class="{ good: serviceWorkerData.pushReg }">
          <div class="listSubDiv">
            <span class="cardIcon" v-if="serviceWorkerData && serviceWorkerData.pushReg">
              <i class="fas fa-check"></i>
            </span>
            <span class="cardIcon" v-if="serviceWorkerData && !serviceWorkerData.pushReg">
              <i class="fas fa-times"></i>
            </span>

            <span>
              Service Worker has a
              <code>pushManager</code> registration
            </span>
          </div>

          <span class="subScoreSpan" v-if="serviceWorkerData && serviceWorkerData.pushReg">5</span>

          <span class="subScoreSpan" v-if="serviceWorkerData && !serviceWorkerData.pushReg">0</span>
        </li>
      </ul>

      <ul v-if="category === 'Service Worker' && !serviceWorkerData && !noServiceWorker">
        <li>
          <span class="skeletonSpan"></span>
        </li>
        <li>
          <span class="skeletonSpan"></span>
        </li>
        <li>
          <span class="skeletonSpan"></span>
        </li>
        <li>
          <span class="skeletonSpan"></span>
        </li>
      </ul>

      <ul id="noSWP" v-if="category === 'Service Worker' && noServiceWorker">
        <li>
          <div class="listSubDiv">
            <span class="cardIcon">
              <i class="fas fa-times"></i>
            </span>

            <span>Has a Service Worker</span>
          </div>

          <span class="subScoreSpan">0</span>
        </li>
        <li>
          <div class="listSubDiv">
            <span class="cardIcon">
              <i class="fas fa-times"></i>
            </span>

            <span>Service Worker has cache handlers</span>
          </div>

          <span class="subScoreSpan">0</span>
        </li>
        <li>
          <div class="listSubDiv">
            <span class="cardIcon">
              <i class="fas fa-times"></i>
            </span>

            <span>
              Service Worker has the correct
              <code>scope</code>
            </span>
          </div>

          <span class="subScoreSpan">0</span>
        </li>
        <li>
          <div class="listSubDiv">
            <span class="cardIcon">
              <i class="fas fa-times"></i>
            </span>

            <span>
              Service Worker has a
              <code>pushManager</code> registration
            </span>
          </div>

          <span class="subScoreSpan">0</span>
        </li>
      </ul>
    </div>

    <div id="cardEditBlock">
      <nuxt-link v-if="category === 'Service Worker'" to="/serviceworker">
        <button>
          Choose a Service Worker
          <i class="fas fa-arrow-right"></i>
        </button>

      </nuxt-link>

      <nuxt-link v-else-if="category === 'Manifest'" to="/generate">
        <button v-if="!noManifest" id="editButton">
          View Manifest
          <i class="fas fa-arrow-right"></i>
        </button>

        <button v-else-if="noManifest && !brokenManifest">
          View Generated Manifest
          <i class="fas fa-arrow-right"></i>
        </button>
        <div
          class="brkManifestError"
          v-if="brokenManifest"
        >The manifest is declared but cannot be reached</div>
      </nuxt-link>

      <div
        class="brkManifestError"
        v-if="category === 'Security' && !validSSL"
      >Site could not be reached, check your https cert please</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Prop } from "vue-property-decorator";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

import * as generator from "~/store/modules/generator";

const GeneratorState = namespace(generator.name, State);
const GeneratorAction = namespace(generator.name, Action);

const apiUrl = `${process.env.apiUrl}/serviceworkers/getServiceWorkerFromUrl?siteUrl`;

@Component({})
export default class extends Vue {
  @GeneratorAction getManifestInformation;
  @GeneratorState manifest: any;

  @GeneratorAction updateManifest;

  @Prop() public category;
  @Prop() public url;

  hasHTTPS: boolean | null = null;
  validSSL: boolean | null = null;
  noMixedContent: boolean | null = null;

  noManifest: boolean | null = null;
  brokenManifest: boolean | null = null;
  serviceWorkerData: any = null;
  noServiceWorker: boolean | null = null;

  manifestScore: number = 0;
  swScore: number = 0;
  securityScore: number = 0;

  created() {

    switch (this.category) {
      case "Security":
        this.lookAtSecurity();
        break;
      case "Manifest":
        this.lookAtManifest();
        break;
      case "Service Worker":
        this.lookAtSW();
        break;
      default:
        console.log("no data");
    }
  }

  private lookAtSecurity(): Promise<void> {
    return new Promise(resolve => {
      if (this.url && this.url.includes("https")) {
        this.hasHTTPS = true;
        this.validSSL = true;
        this.noMixedContent = true;

        this.securityScore = 20;
      }

      this.$emit("securityTestDone", { score: 20 });
      resolve();
    });
  }

  private lookAtManifest(): Promise<void> {
    return new Promise(async resolve => {
      try {
        await this.getManifestInformation();
      } catch (ex) {
        if (this.manifest === null) {
          this.brokenManifest = true;

          this.hasHTTPS = false;
          this.validSSL = false;
          this.noMixedContent = false;

          this.securityScore = 0;

          this.$emit("securityTestDone", { score: 0 });
        }
        this.noManifest = true;
        resolve();
        return;
      }

      if (this.manifest && this.manifest.generated === true) {
        this.noManifest = true;
        resolve();
      } else {
        this.noManifest = false;

        this.manifestScore = 15;
        //scoring set by Jeff: 40 for manifest, 40 for sw and 20 for sc
        if (this.manifest.display !== undefined) {
          this.manifestScore = this.manifestScore + 5;
        }

        if (this.manifest.icons !== undefined) {
          this.manifestScore = this.manifestScore + 5;
        }

        if (this.manifest.name !== undefined) {
          this.manifestScore = this.manifestScore + 5;
        }

        if (this.manifest.short_name !== undefined) {
          this.manifestScore = this.manifestScore + 5;
        }

        if (this.manifest.start_url !== true) {
          this.manifestScore = this.manifestScore + 5;
        }

        if (this.manifest.generated === true) {
          this.manifestScore = 0;
        }

        this.updateManifest(this.manifest);
        this.$emit("manifestTestDone", { score: this.manifestScore });
        resolve();
      }
    });
  }

  private async lookAtSW() {
    const savedData = sessionStorage.getItem(this.url);
    const savedScore = sessionStorage.getItem("swScore");

    if (savedData) {

      try {
        let cleanedData = JSON.parse(savedData);
        this.serviceWorkerData = cleanedData;
      } catch (err) {
        this.$emit("serviceWorkerTestDone", { score: 0 });
        this.noServiceWorker = true;
        this.swScore = 0;
      }

      if (savedScore) {
        let cleanedScore = JSON.parse(savedScore);
        this.swScore = cleanedScore;

        this.$emit("serviceWorkerTestDone", { score: this.swScore });
      }
    } else {
      const response = await fetch(`${apiUrl}=${this.url}`);
      const data = await response.json();

      if (data.swURL) {
        this.serviceWorkerData = data.swURL;
      }

      if (this.serviceWorkerData && this.serviceWorkerData !== false) {
        sessionStorage.setItem(
          this.url,
          JSON.stringify(this.serviceWorkerData)
        );
      }

      if (
        !this.serviceWorkerData || this.serviceWorkerData.swURL === null ||
        this.serviceWorkerData.swURL === false
      ) {
        this.noServiceWorker = true;

        this.swScore = 0;
        this.$emit("serviceWorkerTestDone", { score: 0 });

        return;
      } else {
        this.noServiceWorker = false;

        this.swScore = 0;
        //scoring set by Jeff: 40 for manifest, 40 for sw and 20 for sc

        if (this.serviceWorkerData.hasSW !== null) {
          this.swScore = this.swScore + 20;
        }
        /*
        Caches stuff
        +10 points to user
      */
        if (this.serviceWorkerData.cache) {
          /*const hasCache = this.serviceWorkerData.cache.some(
            entry => entry.fromSW === true
          );*/

          this.swScore = this.swScore + 10;
        }
        /*
        Has push reg
        +5 points to user
      */
        if (this.serviceWorkerData.pushReg !== null) {
          this.swScore = this.swScore + 5;
        }
        /*
        Has scope that points to root
        +5 points to user
      */
        if (
          this.serviceWorkerData.scope //&&
          // this.serviceWorkerData.scope.slice(0, -1) ===
          // new URL(this.serviceWorkerData.scope).origin  //slice isn't working and score not showing up, TODO: look at how to validate scope
        ) {
          this.swScore = this.swScore + 5;
        }

        sessionStorage.setItem("swScore", JSON.stringify(this.swScore));

        this.$emit("serviceWorkerTestDone", { score: this.swScore });
        return;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.cardScore {
  color: #c5c5c5;
  font-weight: bold;
  font-size: 12px;

  .subScore {
    color: #707070;
    font-size: 24px;
  }
}

#cardContent {
  flex: 1;
}

#scoreCard {
  background: white;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  padding-top: 24px;
  padding-left: 30px;
  padding-right: 30px;
  min-height: 404px;

  #cardEditBlock {
    display: flex;
    justify-content: center;

    button {
      color: #9337d8;
      background: none;
      border: none;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 20px;
    }
  }

  #headerDiv {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    align-items: center;
  }

  h3 {
    color: #707070;

    font-family: Poppins;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 18px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  ul {
    flex-grow: 2;
    list-style: none;
    padding: 0;
    margin: 0;
    margin-bottom: 42px;

    li.good {
      font-weight: normal;
      color: initial;

      .cardIcon {
        margin-right: 16px;
        color: initial;
        color: #707070;
        font-size: 12px;
      }

      .subScoreSpan {
        font-size: 14px;
        font-weight: bold;
        color: #707070;
      }
    }

    li {
      font-size: 14px;
      font-weight: bold;
      padding: 0.5em;
      padding-left: 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 5px;
      color: #3c3c3c span {
        font-style: normal;
        font-weight: normal;
        font-size: 14px;
        line-height: 18px;
        color: #3c3c3c;
      }

      .listSubDiv {
        display: flex;
        margin-right: 11px;
        align-items: center;
        font-family: "Open Sans", sans-serif;
      }

      .subScoreSpan {
        font-size: 14px;
        font-weight: bold;
        color: #db3457;
      }

      .cardIcon {
        color: #db3457;
        margin-right: 8px;
        font-size: 12px;
      }

      code {
        padding: 3px;
        background: rgba(60, 60, 60, 0.05);
        border-radius: 4px;
        height: 24px;
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 14px;
        padding-left: 8px;
        padding-right: 8px;
        color: #000000;
      }
    }
  }

  #extrasP {
    flex-grow: 2;
  }

  #noSWP {
    flex-grow: 2;
    margin-bottom: 2em;
  }

  .skeletonSpan {
    background: linear-gradient(
      to right,
      rgba(140, 140, 140, 0.8),
      rgba(140, 140, 140, 0.18),
      rgba(140, 140, 140, 0.33)
    );
    background-size: 800px 104px;
    animation-duration: 1s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: shimmer;
    animation-timing-function: linear;
    height: 1em;
    width: 100%;
  }

  @keyframes shimmer {
    0% {
      background-position: -468px 0;
    }

    100% {
      background-position: 468px 0;
    }
  }

  .brkManifestError {
    color: red;
    font-weight: bold;
    padding-top: 1em;
    padding-bottom: 1em;
    font-size: 14px;
    text-align: center;
  }
}
</style>