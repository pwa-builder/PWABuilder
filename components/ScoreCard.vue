<template>
  <div id="scoreCard">
    <h3>{{category}}</h3>

    <div id="cardContent">
      <!-- Security section -->
      <ul v-if="category === 'Security'">
        <li>
          <span>Uses HTTPS URL</span>
          <span v-if="hasHTTPS">
            <i class="fas fa-check"></i>
          </span>
          
          <span v-else>
            <i class="fas fa-times"></i>
          </span>
        </li>
        <li>
          <span>Valid SSL certificate is use</span>
          <span v-if="validSSL">
            <i class="fas fa-check"></i>
          </span>
          
          <span v-else>
            <i class="fas fa-times"></i>
          </span>
        </li>
        <li>
          <span>No "mixed" content on page</span>
          <span v-if="noMixedContent">
            <i class="fas fa-check"></i>
          </span>
          
          <span v-else>
            <i class="fas fa-times"></i>
          </span>
        </li>
      </ul>

      <!-- Manifest section -->
      <ul v-if="category === 'Manifest' && manifest && !noManifest">
        <li v-bind:class="{ good: manifest }">
          <span>Web Manifest properly attached</span>
          
          <span v-if="manifest">
            <i class="fas fa-check"></i>
          </span>
          <span v-if="!manifest">
            <i class="fas fa-times"></i>
          </span>
        </li>
        <li v-bind:class="{ good: manifest && manifest.display }">
          <span>Display property utilized</span>
          
          <span v-if="manifest && manifest.display">
            <i class="fas fa-check"></i>
          </span>
          <span v-if="manifest && !manifest.display">
            <i class="fas fa-times"></i>
          </span>
        </li>
        <li v-bind:class="{ good: manifest && manifest.icons }">
          <span>Lists icons for add to home screen</span>
          
          <span v-if="manifest && manifest.icons">
            <i class="fas fa-check"></i>
          </span>
          <span v-if="manifest && !manifest.icons">
            <i class="fas fa-times"></i>
          </span>
        </li>
        <li v-bind:class="{ good: manifest && manifest.name }">
          <span>Contains app_name property</span>
          
          <span v-if="manifest && manifest.name">
            <i class="fas fa-check"></i>
          </span>
          <span v-if="manifest && !manifest.name">
            <i class="fas fa-times"></i>
          </span>
        </li>
        <li v-bind:class="{ good: manifest && manifest.short_name }">
          <span>Contains short_name property</span>
          
          <span v-if="manifest && manifest.short_name">
            <i class="fas fa-check"></i>
          </span>
          <span v-if="manifest && !manifest.short_name">
            <i class="fas fa-times"></i>
          </span>
        </li>
        <li v-bind:class="{ good: manifest && manifest.start_url }">
          <span>Designates a start_url</span>
          
          <span v-if="manifest && manifest.start_url">
            <i class="fas fa-check"></i>
          </span>
          <span v-if="manifest && !manifest.start_url">
            <i class="fas fa-times"></i>
          </span>
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
          <span>Web Manifest properly attached</span>
          <span>
            <i class="fas fa-times"></i>
          </span>
        </li>
        <li>
          <span>Display property utilized</span>
          <span>
            <i class="fas fa-times"></i>
          </span>
        </li>
        <li>
          <span>Lists icons for add to home screen</span>
          <span>
            <i class="fas fa-times"></i>
          </span>
        </li>
        <li>
          <span>Contains app_name property</span>
          <span>
            <i class="fas fa-times"></i>
          </span>
        </li>
        <li>
          <span>Contains short_name property</span>
          <span>
            <i class="fas fa-times"></i>
          </span>
        </li>
        <li>
          <span>Designates a start_url</span>
          <span>
            <i class="fas fa-times"></i>
          </span>
        </li>
      </ul>

      <!-- service worker section -->
      <ul v-if="category === 'Service Worker' && serviceWorkerData">
        <li v-bind:class="{ good: serviceWorkerData.hasSW }">
          <span>Has a Service Worker</span>
          <span v-if="serviceWorkerData && serviceWorkerData.hasSW">
            <i class="fas fa-check"></i>
          </span>
          <span v-if="serviceWorkerData && !serviceWorkerData.hasSW">
            <i class="fas fa-times"></i>
          </span>
        </li>
        <li v-bind:class="{ good: serviceWorkerData.cache }">
          <span>Service Worker has cache handlers</span>
          <span v-if="serviceWorkerData && serviceWorkerData.cache">
            <i class="fas fa-check"></i>
          </span>
          <span v-if="serviceWorkerData && !serviceWorkerData.cache">
            <i class="fas fa-times"></i>
          </span>
        </li>
        <li v-bind:class="{ good: serviceWorkerData.scope }">
          <span>Service Worker has the correct scope</span>
          <span v-if="serviceWorkerData && serviceWorkerData.scope">
            <i class="fas fa-check"></i>
          </span>
          <span v-if="serviceWorkerData && !serviceWorkerData.scope">
            <i class="fas fa-times"></i>
          </span>
        </li>
        <li v-bind:class="{ good: serviceWorkerData.pushReg }">
          <span>Service Worker has a push registration</span>
          <span v-if="serviceWorkerData && serviceWorkerData.pushReg">
            <i class="fas fa-check"></i>
          </span>
          <span v-if="serviceWorkerData && !serviceWorkerData.pushReg">
            <i class="fas fa-times"></i>
          </span>
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
          <span>Has a Service Worker</span>
          <span>
            <i class="fas fa-times"></i>
          </span>
        </li>
        <li>
          <span>Service Worker has cache handlers</span>
          <span>
            <i class="fas fa-times"></i>
          </span>
        </li>
        <li>
          <span>Service Worker has the correct scope</span>
          <span>
            <i class="fas fa-times"></i>
          </span>
        </li>
        <li>
          <span>Service Worker has a push registration</span>
          <span>
            <i class="fas fa-times"></i>
          </span>
        </li>
      </ul>
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

        let manifestScore = 0;

        if (this.manifest.display !== undefined) {
          manifestScore = manifestScore + 7.7;
        }

        if (this.manifest.icons !== undefined) {
          manifestScore = manifestScore + 7.7;
        }

        if (this.manifest.name !== undefined) {
          manifestScore = manifestScore + 7.7;
        }

        if (this.manifest.short_name !== undefined) {
          manifestScore = manifestScore + 7.7;
        }

        if (this.manifest.start_url !== true) {
          manifestScore = manifestScore + 7.7;
        }

        if (this.manifest.generated === true) {
          manifestScore = 0;
        }

        this.$emit("manifestTestDone", { score: manifestScore });
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

      let swScore = 0;
      /*
        Has service worker
        +50 points to user
      */
      if (this.serviceWorkerData.hasSW !== null) {
        swScore = swScore + 7.7;
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
          swScore = swScore + 7.7;
        }
      }
      /*
        Has push reg
        +10 points to user
      */
      if (this.serviceWorkerData.pushReg !== null) {
        swScore = swScore + 7.7;
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
        swScore = swScore + 7.7;
      }

      this.$emit('serviceWorkerTestDone', { score: swScore });
      return;
    }
  }
}
</script>

<style lang="scss" scoped>
#scoreCard {
  border: solid #C5C5C5 1px;
  padding: 11px;
  background: white;
  display: flex;
  flex-direction: column;
  width: 390px;
  height: 339px;

  h3 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  ul {
    flex-grow: 2;
    list-style: none;
    padding: 0;
    margin: 0;
    margin-bottom: 42px;

    li {
      font-size: 18px;
      padding: 0.5em;
      padding-left: 0;
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      span {
        margin-left: 8px;
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