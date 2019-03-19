<template>
  <div id="scoreCard">
    <div id="headerDiv">
      <h3>{{category}}</h3>

      <div v-if="category === 'Manifest'" class="cardScore">
        <span class="subScore">{{manifestScore}}</span> / 100
      </div>

      <div v-else-if="category === 'Service Worker'" class="cardScore">
        <span class="subScore">{{swScore}}</span> / 100
      </div>

      <div v-else-if="category === 'Security'" class="cardScore">
        <span class="subScore">100</span> / 100
      </div>
    </div>

    <div id="cardContent">
      <!-- Security section -->
      <ul v-if="category === 'Security'">
        <li class="good">
          <span class="cardIcon" v-if="hasHTTPS">
            <i class="fas fa-check"></i>
          </span>
          
          <span class="cardIcon" v-else>
            <i class="fas fa-times"></i>
          </span>
          
          <span>Uses HTTPS URL</span>
        </li>
        <li class="good">
          <span class="cardIcon" v-if="validSSL">
            <i class="fas fa-check"></i>
          </span>
          
          <span class="cardIcon" v-else>
            <i class="fas fa-times"></i>
          </span>
          
          <span>Valid SSL certificate is use</span>
        </li>
        <li class="good">
          <span class="cardIcon" v-if="noMixedContent">
            <i class="fas fa-check"></i>
          </span>
          
          <span class="cardIcon" v-else>
            <i class="fas fa-times"></i>
          </span>
          
          <span>No "mixed" content on page</span>
        </li>
      </ul>

      <!-- Manifest section -->
      <ul v-if="category === 'Manifest' && manifest && !noManifest">
        <li v-bind:class="{ good: manifest }">
          <span class="cardIcon" v-if="manifest">
            <i class="fas fa-check"></i>
          </span>
          <span class="cardIcon" v-if="!manifest">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Web Manifest properly attached</span>
        </li>
        <li v-bind:class="{ good: manifest && manifest.display }">
          <span class="cardIcon" v-if="manifest && manifest.display">
            <i class="fas fa-check"></i>
          </span>
          <span class="cardIcon" v-if="manifest && !manifest.display">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Display property utilized</span>
        </li>
        <li v-bind:class="{ good: manifest && manifest.icons }">
          <span class="cardIcon" v-if="manifest && manifest.icons">
            <i class="fas fa-check"></i>
          </span>
          <span class="cardIcon" v-if="manifest && !manifest.icons">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Lists icons for add to home screen</span>
        </li>
        <li v-bind:class="{ good: manifest && manifest.name }">
          <span class="cardIcon" v-if="manifest && manifest.name">
            <i class="fas fa-check"></i>
          </span>
          <span class="cardIcon" v-if="manifest && !manifest.name">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Contains app_name property</span>
        </li>
        <li v-bind:class="{ good: manifest && manifest.short_name }">
          <span class="cardIcon" v-if="manifest && manifest.short_name">
            <i class="fas fa-check"></i>
          </span>
          <span class="cardIcon" v-if="manifest && !manifest.short_name">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Contains short_name property</span>
        </li>
        <li v-bind:class="{ good: manifest && manifest.start_url }">
          <span class="cardIcon" v-if="manifest && manifest.start_url">
            <i class="fas fa-check"></i>
          </span>
          <span class="cardIcon" v-if="manifest && !manifest.start_url">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Designates a start_url</span>
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
          <span class="cardIcon">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Web Manifest properly attached</span>
        </li>
        <li>
          <span class="cardIcon">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Display property utilized</span>
        </li>
        <li>
          <span class="cardIcon">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Lists icons for add to home screen</span>
        </li>
        <li>
          <span class="cardIcon">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Contains app_name property</span>
        </li>
        <li>
          <span class="cardIcon">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Contains short_name property</span>
        </li>
        <li>
          <span class="cardIcon">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Designates a start_url</span>
        </li>
      </ul>

      <!-- service worker section -->
      <ul v-if="category === 'Service Worker' && serviceWorkerData">
        <li v-bind:class="{ good: serviceWorkerData.hasSW }">
          <span class="cardIcon" v-if="serviceWorkerData && serviceWorkerData.hasSW">
            <i class="fas fa-check"></i>
          </span>
          <span class="cardIcon" v-if="serviceWorkerData && !serviceWorkerData.hasSW">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Has a Service Worker</span>
        </li>
        <li v-bind:class="{ good: serviceWorkerData.cache }">
          <span class="cardIcon" v-if="serviceWorkerData && serviceWorkerData.cache">
            <i class="fas fa-check"></i>
          </span>
          <span class="cardIcon" v-if="serviceWorkerData && !serviceWorkerData.cache">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Service Worker has cache handlers</span>
        </li>
        <li v-bind:class="{ good: serviceWorkerData.scope }">
          <span class="cardIcon" v-if="serviceWorkerData && serviceWorkerData.scope">
            <i class="fas fa-check"></i>
          </span>
          <span class="cardIcon" v-if="serviceWorkerData && !serviceWorkerData.scope">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Service Worker has the correct scope</span>
        </li>
        <li v-bind:class="{ good: serviceWorkerData.pushReg }">
          <span class="cardIcon" v-if="serviceWorkerData && serviceWorkerData.pushReg">
            <i class="fas fa-check"></i>
          </span>
          <span class="cardIcon" v-if="serviceWorkerData && !serviceWorkerData.pushReg">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Service Worker has a push registration</span>
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
          <span class="cardIcon">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Has a Service Worker</span>
        </li>
        <li>
          <span class="cardIcon">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Service Worker has cache handlers</span>
        </li>
        <li>
          <span class="cardIcon">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Service Worker has the correct scope</span>
        </li>
        <li>
          <span class="cardIcon">
            <i class="fas fa-times"></i>
          </span>
          
          <span>Service Worker has a push registration</span>
        </li>
      </ul>
    </div>

    <div id="cardEditBlock">
    
      <nuxt-link v-if="category === 'Service Worker'" to="/serviceworker">
        <button id="editButton">
          Edit Service Worker
          <i class="fas fa-arrow-right"></i>
        </button>
      </nuxt-link>

      <nuxt-link v-else-if="category === 'Manifest'" to="/generate">
        <button id="editButton">
          Edit Manifest
          <i class="fas fa-arrow-right"></i>
        </button>
      </nuxt-link>
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

const apiUrl = `${
  process.env.apiUrl
}/serviceworkers/getServiceWorkerFromUrl?siteUrl`;

@Component({})
export default class extends Vue {
  @GeneratorAction getManifestInformation;
  @GeneratorState manifest: any;

  @Prop() public category;
  @Prop() public url;

  hasHTTPS: boolean | null = null;
  validSSL: boolean | null = null;
  noMixedContent: boolean | null = null;

  noManifest: boolean | null = null;

  serviceWorkerData: any = null;
  noServiceWorker: boolean | null = null;

  manifestScore: number = 0;
  swScore: number = 0;
  securityScore: number = 0;

  mounted() {
    console.log("im a card");

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
      }

      console.log("looking at security");
      this.$emit("securityTestDone", { score: 23.1 });
      resolve();
    });
  }

  private lookAtManifest(): Promise<void> {
    return new Promise(async resolve => {
      await this.getManifestInformation();
      console.log("manifestInfo", this.manifest);

      if (this.manifest.generated === true) {
        this.noManifest = true;
        resolve();
      } else {
        this.noManifest = false;

        this.manifestScore = 0;

        if (this.manifest.display !== undefined) {
          this.manifestScore = this.manifestScore + 7.7;
        }

        if (this.manifest.icons !== undefined) {
          this.manifestScore = this.manifestScore + 7.7;
        }

        if (this.manifest.name !== undefined) {
          this.manifestScore = this.manifestScore + 7.7;
        }

        if (this.manifest.short_name !== undefined) {
          this.manifestScore = this.manifestScore + 7.7;
        }

        if (this.manifest.start_url !== true) {
          this.manifestScore = this.manifestScore + 7.7;
        }

        if (this.manifest.generated === true) {
          this.manifestScore = 0;
        }

        this.$emit("manifestTestDone", { score: this.manifestScore });
        resolve();
      }
    });
  }

  private async lookAtSW() {
    console.log("fetching sw");
    const response = await fetch(`${apiUrl}=${this.url}`);
    const data = await response.json();
    console.log("lookAtSW", data);

    this.serviceWorkerData = data;

    console.log("this.serviceWorkerData", this.serviceWorkerData);
    console.log(this.serviceWorkerData);

    if (this.serviceWorkerData === false) {
      this.noServiceWorker = true;
      return;
    } else {
      this.noServiceWorker = false;

      this.swScore = 0;
      /*
        Has service worker
        +50 points to user
      */
      if (this.serviceWorkerData.hasSW !== null) {
        this.swScore = this.swScore + 7.7;
      }
      /*
        Caches stuff
        +30 points to user
      */
      if (this.serviceWorkerData.cache) {
        const hasCache = this.serviceWorkerData.cache.some(
          entry => entry.fromSW === true
        );
        console.log(hasCache);
        if (hasCache === true) {
          this.swScore = this.swScore + 7.7;
        }
      }
      /*
        Has push reg
        +10 points to user
      */
      if (this.serviceWorkerData.pushReg !== null) {
        this.swScore = this.swScore + 7.7;
      }
      /*
        Has scope that points to root
        +10 points to user
      */
      if (
        this.serviceWorkerData.scope &&
        this.serviceWorkerData.scope.slice(0, -1) ===
          new URL(this.serviceWorkerData.scope).origin
      ) {
        console.log("has scope");
        this.swScore = this.swScore + 7.7;
      }

      this.$emit("serviceWorkerTestDone", { score: this.swScore });
      return;
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
  width: 32%;
  height: 339px;
  border-radius: 4px;
  padding-top: 24px;
  padding-left: 30px;
  padding-right: 30px;

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
    font-size: 16px;
    font-weight: bold;
    color: #707070;
    border-bottom: solid 1px #c5c5c5;
    padding-bottom: 7px;
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
        margin-right: 8px;
        color: initial;
      }
    }

    li {
      font-size: 14px;
      font-weight: bold;
      padding: 0.5em;
      padding-left: 0;
      display: flex;
      flex-direction: row;
      color: #3c3c3c;
      align-items: center;

      .cardIcon {
        color: red;
        margin-right: 8px;
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
}
</style>