<template>
  <div class="scoreCard">
    <div class="headerDiv">
      <h3>{{ category }}</h3>

      <div v-if="category === 'Manifest'" class="cardScore">
        <span class="subScore">{{ Math.round(manifestScore) }}</span> / 40
      </div>

      <div v-else-if="category === 'Service Worker'" class="cardScore">
        <span class="subScore">{{ swScore }}</span> / 40
      </div>

      <div v-else-if="category === 'Security'" class="cardScore">
        <span class="subScore">{{ Math.round(securityScore) }}</span> / 20
      </div>
    </div>

    <div class="cardContent" v-if="this.timedOutSW !== true">
      <!-- Security section -->
      <div id="securityBlock" v-if="category === 'Security'">
        <h4>Required</h4>

        <ul>
          <li v-bind:class="{ good: hasHTTPS }">
            <div>
              <span class="cardIcon" aria-hidden="true" v-if="hasHTTPS">
                <i class="fas fa-check"></i>
              </span>

              <span class="cardIcon" aria-hidden="true" v-else>
                <i class="fas fa-times"></i>
              </span>

              <span>Uses HTTPS URL</span>
            </div>

            <span class="subScoreSpan" v-if="hasHTTPS">10</span>

            <span class="subScoreSpan" v-else-if="!hasHTTPS">0</span>
          </li>
          <li v-bind:class="{ good: validSSL }">
            <div>
              <span class="cardIcon" aria-hidden="true" v-if="validSSL">
                <i class="fas fa-check"></i>
              </span>
              <span class="cardIcon" aria-hidden="true" v-else-if="!validSSL">
                <i class="fas fa-times"></i>
              </span>

              <span>Valid SSL certificate is used</span>
            </div>

            <span class="subScoreSpan" v-if="validSSL">5</span>

            <span class="subScoreSpan" v-else-if="!validSSL">0</span>
          </li>
          <li v-bind:class="{ good: noMixedContent }">
            <div>
              <span class="cardIcon" aria-hidden="true" v-if="noMixedContent">
                <i class="fas fa-check"></i>
              </span>

              <span class="cardIcon" aria-hidden="true" v-else>
                <i class="fas fa-times"></i>
              </span>

              <span>No "mixed" content on page</span>
            </div>

            <span class="subScoreSpan" v-if="noMixedContent">5</span>

            <span class="subScoreSpan" v-else-if="!noMixedContent">0</span>
          </li>
        </ul>
      </div>

      <!-- loading experience -->
      <ul v-if="category === 'Manifest' && !manifestData && !noManifest">
        <li>
          <div class="listSubDiv">
            <span class="cardIcon" aria-hidden="true"></span>

            <span>Web Manifest is properly attached</span>
          </div>

          <span class="subScoreSpan">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
        </li>

        <li>
          <div class="listSubDiv">
            <span class="cardIcon" aria-hidden="true"></span>

            <span>Web Manifest is properly attached</span>
          </div>

          <span class="subScoreSpan">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
        </li>

        <li>
          <div class="listSubDiv">
            <span class="cardIcon" aria-hidden="true"></span>

            <span>Web Manifest is properly attached</span>
          </div>

          <span class="subScoreSpan">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
        </li>
      </ul>

      <!-- Manifest section -->
      <div
        id="manifestBlock"
        v-if="category === 'Manifest' && manifestData && !noManifest"
      >
        <h4>Required</h4>

        <ul>
          <li v-bind:class="{ good: manifestData }">
            <div class="listSubDiv">
              <span class="cardIcon" aria-hidden="true" v-if="manifestData">
                <i class="fas fa-check"></i>
              </span>
              <span class="cardIcon" aria-hidden="true" v-if="!manifestData">
                <i class="fas fa-times"></i>
              </span>

              <span>Web Manifest properly attached</span>
            </div>

            <span class="subScoreSpan" v-if="manifestData">15</span>

            <span class="subScoreSpan" v-else-if="!manifestData">0</span>
          </li>
          <li v-bind:class="{ good: manifestData && manifestData.display }">
            <div class="listSubDiv">
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="manifestData && manifestData.display"
              >
                <i class="fas fa-check"></i>
              </span>
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="manifestData && !manifestData.display"
              >
                <i class="fas fa-times"></i>
              </span>

              <span> <code>display</code> property utilized </span>
            </div>

            <span class="subScoreSpan" v-if="manifestData.display">5</span>

            <span class="subScoreSpan" v-else-if="!manifestData.display"
              >0</span
            >
          </li>
          <li v-bind:class="{ good: manifestData && manifestData.icons }">
            <div class="listSubDiv">
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="manifestData && manifestData.icons"
              >
                <i class="fas fa-check"></i>
              </span>
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="manifestData && !manifestData.icons"
              >
                <i class="fas fa-times"></i>
              </span>

              <span>
                Lists
                <code>icons</code> for add to home screen
              </span>
            </div>

            <span class="subScoreSpan" v-if="manifestData.icons">5</span>

            <span class="subScoreSpan" v-else-if="!manifestData.icons">0</span>
          </li>
          <li v-bind:class="{ good: manifestData && manifest.name }">
            <div class="listSubDiv">
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="manifestData && manifestData.name"
              >
                <i class="fas fa-check"></i>
              </span>
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="manifestData && !manifestData.name"
              >
                <i class="fas fa-times"></i>
              </span>

              <span>
                Contains
                <code>name</code> property
              </span>
            </div>

            <span class="subScoreSpan" v-if="manifestData.name">5</span>

            <span class="subScoreSpan" v-else-if="!manifestData.name">0</span>
          </li>
          <li v-bind:class="{ good: manifestData && manifestData.short_name }">
            <div class="listSubDiv">
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="manifestData && manifestData.short_name"
              >
                <i class="fas fa-check"></i>
              </span>
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="manifestData && !manifestData.short_name"
              >
                <i class="fas fa-times"></i>
              </span>

              <span>
                Contains
                <code>short_name</code> property
              </span>
            </div>

            <span class="subScoreSpan" v-if="manifestData.short_name">5</span>

            <span class="subScoreSpan" v-else-if="!manifestData.short_name"
              >0</span
            >
          </li>

          <li v-bind:class="{ good: manifestData && manifestData.start_url }">
            <div class="listSubDiv">
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="manifestData && manifestData.start_url"
              >
                <i class="fas fa-check"></i>
              </span>
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="manifestData && !manifestData.start_url"
              >
                <i class="fas fa-times"></i>
              </span>

              <span>
                Designates a
                <code>start_url</code>
              </span>
            </div>

            <span class="subScoreSpan" v-if="manifestData.start_url">5</span>

            <span class="subScoreSpan" v-else-if="!manifestData.start_url"
              >0</span
            >
          </li>
        </ul>

        <h4>Recommended</h4>

        <ul>
          <li v-bind:class="{ good: manifestData && manifestData.screenshots }">
            <div class="listSubDiv">
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="manifestData.screenshots"
              >
                <i class="fas fa-check"></i>
              </span>
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="!manifestData.screenshots"
              >
                <i class="fas fa-times"></i>
              </span>

              <span>Has Screenshots</span>
            </div>
          </li>

          <li v-bind:class="{ good: manifestData && manifestData.categories }">
            <div class="listSubDiv">
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="manifestData.categories"
              >
                <i class="fas fa-check"></i>
              </span>
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="!manifestData.categories"
              >
                <i class="fas fa-times"></i>
              </span>

              <span>Has Categories</span>
            </div>
          </li>
        </ul>

        <h4>Optional</h4>

        <ul>
          <li v-bind:class="{ good: manifestData && manifestData.shortcuts }">
            <div class="listSubDiv">
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="manifestData.shortcuts"
              >
                <i class="fas fa-check"></i>
              </span>
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="!manifestData.shortcuts"
              >
                <i class="fas fa-times"></i>
              </span>

              <span>Uses Shortcuts</span>
            </div>
          </li>
        </ul>
      </div>

      <!-- loading experience -->
      <ul v-if="category === 'Manifest' && !manifestData && !noManifest">
        <li>
          <div class="listSubDiv">
            <span class="cardIcon" aria-hidden="true"></span>

            <span>Web Manifest is properly attached</span>
          </div>

          <span class="subScoreSpan">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
        </li>

        <li>
          <div class="listSubDiv">
            <span class="cardIcon" aria-hidden="true"></span>

            <span> <code>display</code> property utilized </span>
          </div>

          <span class="subScoreSpan">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
        </li>

        <li>
          <div class="listSubDiv">
            <span class="cardIcon" aria-hidden="true"></span>

            <span>
              Lists
              <code>icons</code> for add to home screen
            </span>
          </div>

          <span class="subScoreSpan">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
        </li>

        <li>
          <div class="listSubDiv">
            <span class="cardIcon" aria-hidden="true"></span>

            <span>
              Contains
              <code>name</code> property
            </span>
          </div>

          <span class="subScoreSpan">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
        </li>

        <li>
          <div class="listSubDiv">
            <span class="cardIcon" aria-hidden="true"></span>

            <span>
              Contains
              <code>short_name</code> property
            </span>
          </div>

          <span class="subScoreSpan">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
        </li>

        <li>
          <div class="listSubDiv">
            <span class="cardIcon" aria-hidden="true"></span>

            <span>
              Designates a
              <code>start_url</code>
            </span>
          </div>

          <span class="subScoreSpan">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
        </li>
      </ul>

      <ul id="noManifest" v-if="category === 'Manifest' && noManifest">
        <li>
          <div class="listSubDiv">
            <span class="cardIcon" aria-hidden="true">
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

            <span> <code>display</code> property utilized </span>
          </div>

          <span class="subScoreSpan">0</span>
        </li>
        <li>
          <div class="listSubDiv">
            <span class="cardIcon" aria-hidden="true">
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
            <span class="cardIcon" aria-hidden="true">
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
            <span class="cardIcon" aria-hidden="true">
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
            <span class="cardIcon" aria-hidden="true">
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
      <div
        id="serviceWorkerBlock"
        v-if="category === 'Service Worker' && serviceWorkerData"
      >
        <h4>Required</h4>

        <ul>
          <li v-bind:class="{ good: serviceWorkerData.hasSW }">
            <div class="listSubDiv">
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="serviceWorkerData && serviceWorkerData.hasSW"
              >
                <i class="fas fa-check"></i>
              </span>
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="serviceWorkerData && !serviceWorkerData.hasSW"
              >
                <i class="fas fa-times"></i>
              </span>

              <span>Has a Service Worker</span>
            </div>

            <span
              class="subScoreSpan"
              v-if="serviceWorkerData && serviceWorkerData.hasSW"
              >20</span
            >

            <span
              class="subScoreSpan"
              v-if="!serviceWorkerData && !serviceWorkerData.hasSW"
              >0</span
            >
          </li>
          <li v-bind:class="{ good: this.worksOffline }">
            <div class="listSubDiv">
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="serviceWorkerData && this.worksOffline"
              >
                <i class="fas fa-check"></i>
              </span>
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="serviceWorkerData && !this.worksOffline"
              >
                <i class="fas fa-times"></i>
              </span>

              <span>Works offline</span>
            </div>

            <span
              class="subScoreSpan"
              v-if="serviceWorkerData && this.worksOffline"
              >10</span
            >

            <span
              class="subScoreSpan"
              v-if="!serviceWorkerData && !this.worksOffline"
              >0</span
            >
          </li>
          <li v-bind:class="{ good: serviceWorkerData.scope }">
            <div class="listSubDiv">
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="serviceWorkerData && serviceWorkerData.scope"
              >
                <i class="fas fa-check"></i>
              </span>
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="serviceWorkerData && !serviceWorkerData.scope"
              >
                <i class="fas fa-times"></i>
              </span>

              <span>
                Service Worker has the correct
                <code>scope</code>
              </span>
            </div>

            <span
              class="subScoreSpan"
              v-if="serviceWorkerData && serviceWorkerData.scope"
              >10</span
            >

            <span
              class="subScoreSpan"
              v-if="!serviceWorkerData && !serviceWorkerData.scope"
              >0</span
            >
          </li>
          <!-- <li v-bind:class="{ good: serviceWorkerData.pushReg }">
            <div class="listSubDiv">
              <span class="cardIcon" aria-hidden="true" v-if="serviceWorkerData && serviceWorkerData.pushReg">
                <i class="fas fa-check"></i>
              </span>
              <span class="cardIcon" aria-hidden="true" v-if="serviceWorkerData && !serviceWorkerData.pushReg">
                <i class="fas fa-times"></i>
              </span>

              <span>
                Service Worker has a
                <code>pushManager</code> registration
              </span>
            </div>

            <span class="subScoreSpan" v-if="serviceWorkerData && serviceWorkerData.pushReg">5</span>

            <span class="subScoreSpan" v-if="serviceWorkerData && !serviceWorkerData.pushReg">0</span>
          </li>-->
        </ul>

        <h4>Optional</h4>

        <ul>
          <li v-bind:class="{ good: serviceWorkerData.pushReg }">
            <div class="listSubDiv">
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="serviceWorkerData && serviceWorkerData.pushReg"
              >
                <i class="fas fa-check"></i>
              </span>
              <span
                class="cardIcon"
                aria-hidden="true"
                v-if="serviceWorkerData && !serviceWorkerData.pushReg"
              >
                <i class="fas fa-times"></i>
              </span>

              <span>
                Service Worker has a
                <code>pushManager</code> registration
              </span>
            </div>
          </li>
        </ul>
      </div>

      <!-- loading experience -->
      <ul
        v-if="
          category === 'Service Worker' &&
          !serviceWorkerData &&
          !noServiceWorker
        "
      >
        <li>
          <div class="listSubDiv">
            <span class="cardIcon" aria-hidden="true"></span>

            <span>Has a Service Worker</span>
          </div>

          <span class="subScoreSpan">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
        </li>

        <li>
          <div class="listSubDiv">
            <span class="cardIcon" aria-hidden="true"></span>

            <span>Works offline</span>
          </div>

          <span class="subScoreSpan">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
        </li>

        <li>
          <div class="listSubDiv">
            <span class="cardIcon" aria-hidden="true"></span>

            <span>
              Service Worker has the correct
              <code>scope</code>
            </span>
          </div>

          <span class="subScoreSpan">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
        </li>
      </ul>

      <ul id="noSWP" v-if="category === 'Service Worker' && noServiceWorker">
        <li>
          <div class="listSubDiv">
            <span class="cardIcon" aria-hidden="true">
              <i class="fas fa-times"></i>
            </span>

            <span>Has a Service Worker</span>
          </div>

          <span class="subScoreSpan">0</span>
        </li>
        <li>
          <div class="listSubDiv">
            <span class="cardIcon" aria-hidden="true">
              <i class="fas fa-times"></i>
            </span>

            <span>Service Worker has cache handlers</span>
          </div>

          <span class="subScoreSpan">0</span>
        </li>
        <li>
          <div class="listSubDiv">
            <span class="cardIcon" aria-hidden="true">
              <i class="fas fa-times"></i>
            </span>

            <span>
              Service Worker has the correct
              <code>scope</code>
            </span>
          </div>

          <span class="subScoreSpan">0</span>
        </li>
        <!-- <li>
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
        </li>-->
      </ul>
    </div>

    <div class="cardEditBlock">
      <nuxt-link
        v-if="category === 'Service Worker' && serviceWorkerData"
        to="/serviceworker"
        tabindex="-1"
      >
        <button>
          Choose a Service Worker
          <i class="fas fa-arrow-right"></i>
        </button>
      </nuxt-link>

      <div
        class="waitingText"
        v-if="
          category === 'Service Worker' &&
          !serviceWorkerData &&
          !noServiceWorker &&
          this.timedOutSW === false
        "
      >
        Loading your site in the background...this may take a minute
        <br />
      </div>
      <div
        id="timedOutText"
        v-else-if="category === 'Service Worker' && this.timedOutSW === true"
      >
        <i class="fas fa-exclamation-circle"></i>

        <span
          >We could not detect your service worker. If you are sure you have a
          Service Worker registered you may move forward, however be aware that
          your Service Worker may be caching more data than necessary.</span
        >
      </div>
      <div
        class="waitingText"
        v-else-if="category === 'Manifest' && !manifestData && !brokenManifest"
      >
        Loading your site in the background...this may take a minute
        <br />
      </div>

      <nuxt-link
        v-else-if="category === 'Manifest' && !brokenManifest"
        to="/generate"
        tabindex="-1"
      >
        <button v-if="!noManifest" id="editButton">
          View Manifest
          <i class="fas fa-arrow-right"></i>
        </button>

        <button v-else-if="noManifest">
          View Generated Manifest
          <i class="fas fa-arrow-right"></i>
        </button>
      </nuxt-link>
      <div class="brkManifestError" v-if="brokenManifest">
        Couldn't find an app manifest.
        <br />
        <a href="https://developer.mozilla.org/en-US/docs/Web/Manifest"
          >Learn about manifests here</a
        >
      </div>

      <div class="brkManifestError" v-if="category === 'Security' && !validSSL">
        <p>HTTPS not detected.</p>
        <p class="brkManifestHelp">
          <i class="fas fa-info-circle" aria-hidden="true"></i>
          You can use
          <a href="https://letsencrypt.org/">LetsEncrypt</a> to get a free HTTPS
          certificate, or
          <a href="https://azure.microsoft.com/en-us/get-started/web-app/"
            >publish to Azure</a
          >
          to get HTTPS support out of the box
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Prop } from "vue-property-decorator";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

import * as generator from "~/store/modules/generator";
import { Manifest } from "~/store/modules/generator";

import { getCache, setCache } from "~/utils/caching";

const GeneratorState = namespace(generator.name, State);
const GeneratorAction = namespace(generator.name, Action);

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

  manifestData: Manifest | null = null;
  noManifest: boolean | null = null;
  brokenManifest: boolean | null = null;

  serviceWorkerData: any = null;
  noServiceWorker: boolean | null = null;
  timedOutSW: boolean = false;
  worksOffline: boolean | null = null;

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

  private async lookAtSecurity(): Promise<void> {
    try {
      let securityData: any | null = null;

      const cachedData = await getCache("security", this.url);

      if (cachedData) {
        securityData = cachedData;
      } else {
        const response = await fetch(
          `${process.env.testAPIUrl}/Security?site=${this.url}`
        );

        securityData = await response.json();

        await setCache("security", this.url, securityData);
      }

      if (securityData && securityData.data) {
        if (securityData.data.isHTTPS) {
          this.hasHTTPS = true;

          this.securityScore = this.securityScore + 10;
        }

        if (securityData.data.validProtocol) {
          this.validSSL = true;

          this.securityScore = this.securityScore + 5;
        }

        if (securityData.data.valid) {
          this.noMixedContent = true;

          this.securityScore = this.securityScore + 5;
        }

        this.$emit("securityTestDone", { score: this.securityScore });
      }
    } catch (err) {
      this.securityScore = 0;
      this.$emit("securityTestDone", { score: this.securityScore });
    }
  }

  private async lookAtManifest(): Promise<void> {
    // Gets manifest from api, then scores if not generated.
    try {
      const cachedData = await getCache("manifest", this.url);

      if (cachedData) {
        this.manifest = cachedData;

        // Still call this in the background to get manifest
        // into the redux flow for packaging
        await this.getManifestInformation();
      } else {
        await this.getManifestInformation();
        await setCache("manifest", this.url, this.manifest);
      }

      if (this.manifest && this.manifest.generated === true) {
        this.noManifest = true;
        return;
      }

      await this.testManifest();
    } catch (ex) {
      // If manifest is not retrieved or DNE will fall in here. Mostly effects Security Score
      if (this.manifest === null) {
        this.brokenManifest = true;

        this.hasHTTPS = false;
        this.validSSL = false;
        this.noMixedContent = false;

        this.securityScore = 0;

        this.$emit("securityTestDone", { score: 0 });
        this.$emit("manifestDetectionBroke", {});
      }

      this.$emit("manifestTestDone", { score: 0 });

      this.noManifest = true;
    } finally {
      // Regardless update manifest call.
      if (this.manifest) {
        this.updateManifest(this.manifest);
      }
    }
  }

  private async testManifest() {
    this.noManifest = false;

    return new Promise(async (resolve, reject) => {
      let manifestScoreData: any | null = null;

      const cachedData = await getCache("manifestScoreData", this.url);
      if (cachedData) {
        manifestScoreData = cachedData;
      } else {
        // We'll need to analyze the manifest.
        // Send along the manifest contents if we've got 'em.
        const manifestContents = this.getManifestContentsFromSessionStorage();

        try {
          const manifestAnalysisUrl = `${process.env.testAPIUrl}/WebManifest?site=${this.url}`;
          const response = await fetch(manifestAnalysisUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: manifestContents
              ? JSON.stringify({
                  manifest: manifestContents,
                  maniurl: this.url,
                })
              : "",
          });
          manifestScoreData = await response.json();

          await setCache("manifestScoreData", this.url, manifestScoreData);
        } catch (err) {
          reject(err);
        }
      }

      let maniDetailScore = 15;

      const manifestJson = JSON.parse(manifestScoreData.content.json);

      if (manifestScoreData.data !== null || manifestJson) {
        if (
          manifestScoreData.data.required.start_url === true ||
          manifestJson.start_url
        ) {
          maniDetailScore = maniDetailScore + 5;
        }

        if (
          manifestScoreData.data.required.short_name === true ||
          manifestJson.short_name
        ) {
          maniDetailScore = maniDetailScore + 5;
        }

        if (
          manifestScoreData.data.required.name === true ||
          manifestJson.name
        ) {
          maniDetailScore = maniDetailScore + 5;
        }

        if (
          manifestScoreData.data.required.icons === true ||
          manifestJson.icons
        ) {
          maniDetailScore = maniDetailScore + 5;
        }

        if (
          manifestScoreData.data.required.display === true ||
          manifestJson.display
        ) {
          maniDetailScore = maniDetailScore + 5;
        }
      }

      this.manifestScore = maniDetailScore;
      this.manifestData = this.manifest;

      this.$emit("manifestTestDone", { score: this.manifestScore });
      resolve();
    });
  }

  private getManifestContentsFromSessionStorage(): string | null {
    if (sessionStorage && this.url) {
      return sessionStorage.getItem("manifest/" + this.url);
    }

    return null;
  }

  private async lookAtSW() {
    // If we have no URL, it means there was an issue parsing the URL,
    // for example, malformed URL.
    // In such case, punt; there is no service worker.
    const isHttp =
      typeof this.url === "string" && this.url.startsWith("http://");
    if (!this.url || isHttp) {
      this.noSwScore();
      return;
    }

    try {
      let cleanUrl = this.trimSuffixChar(this.url, ".");

      let swResponse: any | null = null;

      const cachedData = await getCache("sw", this.url);

      if (cachedData) {
        swResponse = cachedData;
      } else {
        let response: Response | null = null;

        try {
          response = await fetch(
            `${process.env.testAPIUrl}/ServiceWorker?site=${cleanUrl}`
          );

          if (response.status === 500) {
            this.timedOutSW = true;
            this.swScore = 0;

            this.$emit("serviceWorkerTestDone", { score: 0 });
            return;
          } else {
            swResponse = await response.json();
            await setCache("sw", this.url, swResponse);
          }
        } catch (err) {
          this.timedOutSW = true;
          this.swScore = 0;

          this.$emit("serviceWorkerTestDone", { score: 0 });
          return;
        }
      }

      if (swResponse && swResponse.data) {
        await this.scoreServiceWorker(cleanUrl, swResponse.data);

        this.serviceWorkerData = swResponse.data;

        this.noServiceWorker = false;
      }

      if (
        !this.serviceWorkerData ||
        this.serviceWorkerData.swURL === null ||
        this.serviceWorkerData.swURL === false
      ) {
        this.noSwScore();

        return;
      }

      this.$emit("serviceWorkerTestDone", { score: this.swScore });
    } catch (e) {
      this.noSwScore();
    }
  }

  private async scoreServiceWorker(url, data) {
    this.swScore = 0;
    //scoring set by Jeff: 40 for manifest, 40 for sw and 20 for sc

    if (data.hasSW !== null) {
      this.swScore = this.swScore + 20;
    }
    /*
        Caches stuff
        +10 points to user
      */
    if (data.hasSW !== null) {
      try {
        let offlineCheckData: any | null = null;

        const cachedData = await getCache("offline", this.url);

        if (cachedData) {
          offlineCheckData = cachedData;
        } else {
          const cacheCheckResponse = await fetch(
            `${process.env.testAPIUrl}/Offline?site=${url}`
          );

          offlineCheckData = await cacheCheckResponse.json();

          await setCache("offline", this.url, offlineCheckData);
        }

        if (
          (offlineCheckData && (offlineCheckData.data as string)) === "loaded"
        ) {
          this.worksOffline = true;
          this.swScore = this.swScore + 10;
        }
      } catch (err) {
        console.error("Site does not load offline");
      }
    }
    /*
        Has push reg
        +5 points to user
      */
    // if (this.serviceWorkerData.pushReg !== null) {
    //   this.swScore = this.swScore + 5;
    // }
    /*
        Has scope that points to root
        +5 points to user
      */
    if (
      data.scope //&&
      // this.serviceWorkerData.scope.slice(0, -1) ===
      // new URL(this.serviceWorkerData.scope).origin  //slice isn't working and score not showing up, TODO: look at how to validate scope
    ) {
      this.swScore = this.swScore + 10;
    }
  }

  private noSwScore() {
    this.$emit("serviceWorkerTestDone", { score: 0 });
    this.noServiceWorker = true;
    this.swScore = 0;
  }

  private trimSuffixChar(string, charToRemove) {
    while (string.charAt(string.length - 1) === charToRemove) {
      string = string.substring(0, string.length - 1);
    }
    return string;
  }
}
</script>

<style lang="scss" scoped>
.cardScore {
  color: #707070;
  font-weight: bold;
  font-size: 12px;

  .subScore {
    color: #707070;
    font-size: 24px;
  }
}

.cardContent {
  flex: 1;
}

.scoreCard {
  background: white;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  padding-top: 24px;
  padding-left: 30px;
  padding-right: 30px;
  min-height: 404px;

  .cardEditBlock {
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

  .headerDiv {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    align-items: center;
  }

  h4,
  h3 {
    color: black;

    font-family: sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 15px;
    line-height: 18px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  h4 {
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 12px;
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

  #noSWP,
  #noManifest {
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
    color: #c90005;
    font-weight: bold;
    padding-top: 1em;
    padding-bottom: 1em;
    font-size: 14px;
    text-align: center;
  }

  .waitingText {
    color: black;
    font-weight: bold;
    padding-top: 1em;
    padding-bottom: 1em;
    font-size: 14px;
    text-align: center;
  }

  #timedOutText {
    color: #ff7300;
    font-weight: normal;
    padding-bottom: 1em;
    font-size: 14px;
    display: flex;
  }

  #timedOutText i {
    margin-right: 6px;
    font-size: 18px;
  }

  .brkManifestHelp {
    color: rgb(92, 92, 92);
    font-size: 13px;
  }
}
</style>