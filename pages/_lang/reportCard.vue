<template>
  <div id="hubContainer" :class="{ backgroundReport: gotURL, backgroundIndex: !gotURL }">
    <HubHeader
      v-on:reset="reset()"
      :score="overallScore"
      :showSubHeader="gotURL"
      :expanded="!gotURL"
    ></HubHeader>

    <ion-toast-controller></ion-toast-controller>

    <div v-if="gotURL && overallScore < 80" id="reportShareButtonContainer">
      <button @click="shareReport">
        <i class="fas fa-share-alt"></i>
        Share your Results
      </button>
    </div>

    <main>
      <div v-if="!gotURL" id="inputSection">
        <div id="topHalfHome">
          <h1>Quickly and easily turn your website into an app!</h1>

          <p>
            It's super easy to get started. Just enter the URL of your website
            below
          </p>

          <div v-if="this.error" id="urlErr">{{ $t(this.error) }}</div>

          <form
            @submit.prevent="checkUrlAndGenerate"
            @keydown.enter.prevent="checkUrlAndGenerate"
            :class="{ formErr: error != null }"
          >
            <input
              id="getStartedInput"
              :aria-label="$t('generator.url')"
              :placeholder="$t('generator.placeholder_url')"
              name="siteUrl"
              type="text"
              ref="url"
              v-model="url$"
              autofocus
              autocomplete="off"
            />

            <button :class="{ btnErr: error != null }" id="getStartedButton">
              <div :class="{ btnErrText: error != null }">{{ $t("generator.start") }}</div>
            </button>
          </form>
        </div>

        <div id="bottomHalfHome">
          <!--<div id="expertModeBlock">
            <button @click="skipCheckUrl()" id="expertModeButton">Expert Mode</button>
            <p>Already have a PWA? Skip ahead!</p>
          </div>-->
        </div>
        <footer>
          <p>
            PWA Builder was founded by Microsoft as a community guided, open
            source project to help move PWA adoption forward.
            <a
              href="https://privacy.microsoft.com/en-us/privacystatement"
            >Our Privacy Statement</a>
          </p>
        </footer>
      </div>

      <div v-if="gotURL && overallScore < 80" id="infoSection">
        <h2>Hub</h2>

        <p>
          We have taken a look at how well your website supports PWA features
          and provided simple tools to help you fill in the gaps. When you’re
          ready, click “build my PWA” to finish up.
        </p>
      </div>

      <div v-if="gotURL && overallScore >= 80" id="attachSection">
        <div id="attachHeader">
          <h2>Nice job!</h2>

          <button id="attachShare" @click="shareReport">
            <i class="fas fa-share-alt"></i>
          </button>
        </div>

        <p>
          Ready to build your PWA? Tap "Build My PWA" to package your PWA for the app stores
          or tap "Feature Store" to check out the latest web components from the PWABuilder team to improve your PWA even further!
        </p>

        <div id="attachSectionActions">
          <nuxt-link @click="$awa( { 'referrerUri': 'https://www.pwabuilder.com/publishFromHome' });" id="buildLink" to="/publish">Build My PWA</nuxt-link>
          <nuxt-link @click="$awa( { 'referrerUri': 'https://www.pwabuilder.com/featuresFromHome' });" id="featuresLink" to="/features">Feature Store</nuxt-link>
        </div>
      </div>

      <ScoreCard
        v-if="gotURL"
        v-on:manifestTestDone="manifestTestDone($event)"
        :url="url"
        category="Manifest"
        class="firstCard"
      ></ScoreCard>
      <ScoreCard
        v-if="gotURL"
        v-on:serviceWorkerTestDone="swTestDone($event)"
        :url="url"
        category="Service Worker"
        class="scoreCard"
      ></ScoreCard>
      <ScoreCard
        v-if="gotURL"
        v-on:securityTestDone="securityTestDone($event)"
        :url="url"
        category="Security"
        class="scoreCard"
      ></ScoreCard>

      <div id="toolkitSection" v-if="topSamples.length > 0">
        <h2>Add features to my PWA...</h2>
      </div>

      <FeatureCard
        class="topFeatures"
        v-if="topSamples.length > 0"
        v-for="(sample, index) in topSamples"
        :class="{ firstFeature: index === 0 }"
        :sample="sample"
        :key="sample.id"
        :showAddButton="true"
      >
        <i slot="iconSlot" class="fas fa-rocket"></i>
      </FeatureCard>

      <div id="moreFeaturesBlock" v-if="topSamples.length > 0">
        <nuxt-link to="/features">View More</nuxt-link>
      </div>

      <div v-if="shared" id="shareToast">URL copied for sharing</div>
    </main>
    <footer v-if="gotURL" id="hubFooter">
      <p>
        PWA Builder was founded by Microsoft as a community guided, open source
        project to help move PWA adoption forward.
        <a
          href="https://privacy.microsoft.com/en-us/privacystatement#maincookiessimilartechnologiesmodule"
        >Our Privacy Statement</a>
      </p>
    </footer>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

import HubHeader from "~/components/HubHeader.vue";
import ScoreCard from "~/components/ScoreCard.vue";
import FeatureCard from "~/components/FeatureCard.vue";

import * as generator from "~/store/modules/generator";

const GeneratorState = namespace(generator.name, State);
const GeneratorAction = namespace(generator.name, Action);

import * as windowsStore from "~/store/modules/windows";

const WindowsState = namespace(windowsStore.name, State);
const WindowsAction = namespace(windowsStore.name, Action);

@Component({
  components: {
    HubHeader,
    ScoreCard,
    FeatureCard
  }
})
export default class extends Vue {
  @GeneratorState url: string;
  @GeneratorState manifest: any;

  @GeneratorAction updateLink;
  @GeneratorAction getManifestInformation;

  @WindowsState sample: windowsStore.Sample;
  @WindowsState samples: windowsStore.Sample[];

  @WindowsAction getSamples;

  public gotURL = false;
  public url$: string | null = null;
  public error: string | null = null;
  public overallScore: number = 0;
  public topSamples: Array<any> = [];
  public cleanedURL: string | null = null;
  public shared: boolean = false;

  public async created() {
    this.url$ = this.url;

    if (this.url$ || this.url) {
      this.gotURL = true;
      this.getTopSamples();
    } else {
      if (window && window.location.search) {
        this.processQueryString();
      }
    }
  }

  public mounted() {
    if (this.url) {
      sessionStorage.setItem("currentURL", this.url);
    }

    if ((window as any).CSS && (window as any).CSS.registerProperty) {
      try {
        (CSS as any).registerProperty({
          name: "--color-stop-hub",
          syntax: "<color>",
          inherits: false,
          initialValue: "transparent"
        });

        (CSS as any).registerProperty({
          name: "--color-start-hub",
          syntax: "<color>",
          inherits: false,
          initialValue: "transparent"
        });
      } catch (err) {
        console.error(err);
      }
    }

    const overrideValues = {
      behavior: 0,
      uri: window.location.href,
      pageName: "homePage",
      pageHeight: window.innerHeight
    };

    this.$awa(overrideValues);
    window.addEventListener("popstate", this.backAndForth);
  }

  beforeDestroy() {
    (<any>window).removeEventListener("popstate", this.backAndForth);
  }
  
  public async backAndForth(e) {
    e.preventDefault();
    if (window.location.href === `${window.location.origin}/`) {
      this.reset();
    } else if (window.location.pathname === '/') {
      this.processQueryString();
    } 
  }

  public async shareReport() {
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({
          title: "PWABuilder results",
          text: "Check out how good my PWA did!",
          url: `${location.href}?url=${this.url}`
        });
      } catch (err) {
        // fallback to legacy share if ^ fails
        if ((navigator as any).clipboard) {
          try {
            await (navigator as any).clipboard.writeText(
              `${location.href}?url=${this.url}`
            );
            this.showToast();
          } catch (err) {
            console.error(err);
          }
        } else {
          window.open(`${location.href}?url=${this.url}`, "__blank");
        }
      }
    } else {
      if ((navigator as any).clipboard) {
        try {
          await (navigator as any).clipboard.writeText(
            `${location.href}?url=${this.url}`
          );
          this.showToast();
        } catch (err) {
          console.error(err);
        }
      } else {
        window.open(`${location.href}?url=${this.url}`, "__blank");
      }
    }
  }

  async showToast() {
    const toastCtrl = document.querySelector("ion-toast-controller");
    await (toastCtrl as any).componentOnReady();

    const toast = await (toastCtrl as any).create({
      duration: 2300,
      message: "URL copied for sharing"
    });

    await toast.present();
  }

  public async checkUrlAndGenerate() {
    this.error = null;
    try {
      if (window && !window.location.search && (this.url$ !== null || this.url$ !== undefined)) {
        this.$router.push({ name: 'index', query: { url: this.url$ }})
      }
      else {
        this.url$ = this.cleanedURL;
      }

      await this.updateLink(this.url$);
      this.url$ = this.url;

      if (this.url) {
        sessionStorage.setItem("currentURL", this.url);
      }

      this.gotURL = true;

      this.getTopSamples();
    } catch (err) {
      console.error("url error", err);

      this.url$ = this.url;

      if (err.message) {
        this.error = err.message;
      } else {
        // No error message
        // so just show error directly
        this.error = err;
      }

      this.gotURL = true;
    }
  }

  public async processQueryString() {
      const url = window.location.search.split("=")[1];
      this.cleanedURL = decodeURIComponent(url);
      this.url = this.cleanedURL;
      this.checkUrlAndGenerate();
  }

  public async getTopSamples() {
    await this.getSamples();
    const cleanedSamples = this.samples.slice(0, 4);

    this.topSamples = cleanedSamples;
  }

  public securityTestDone(ev) {
    this.overallScore = this.overallScore + ev.score;
  }

  public manifestTestDone(ev) {
    this.overallScore = this.overallScore + ev.score;
  }

  public swTestDone(ev) {
    this.overallScore = this.overallScore + ev.score;
  }

  public reset() {
    this.gotURL = false;
    this.overallScore = 0;
    this.topSamples = [];
  }

  public skipCheckUrl(): void {
    this.$router.push({
      name: "features"
    });
  }
}

Vue.prototype.$awa = function(config) {
  awa.ct.capturePageView(config);
  return;
};

declare var awa: any;
</script>

<style lang="scss" scoped>
/* stylelint-disable */
@import "~assets/scss/base/variables";

#attachSection {
  grid-column: 3 / span 8;
  background: white;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 2em;
  margin-top: 4em;
  min-height: 12em;

  animation-name: fadein;
  animation-duration: 300ms;
}

#attachSectionActions {
  height: 3em;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

#attachSectionActions #buildLink {
  justify-content: center;
  padding-left: 20px;
  padding-right: 20px;
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  display: flex;
  align-items: center;
  text-align: center;
  background: linear-gradient(to right, #1fc2c8, #9337d8 116%);
  color: white;
  border-radius: 20px;
  height: 40px;
}

#attachSectionActions #featuresLink {
  justify-content: center;
  padding-left: 20px;
  padding-right: 20px;
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  display: flex;
  align-items: center;
  text-align: center;
  background: black;
  color: white;
  border-radius: 20px;
  height: 40px;
  margin-left: 12px;
}

#attachSection #attachHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#attachShare {
  border-radius: 50%;
  width: 2.4em;
  height: 2.4em;
  display: flex;
  justify-content: center;
  align-items: center;
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

#hubFooter {
  display: flex;
  justify-content: center;
  padding-left: 16em;
  padding-right: 16em;
  font-size: 12px;
  color: rgba(60, 60, 60, 0.5);
}

#hubFooter p {
  text-align: center;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 18px;
  color: #707070;
}

#hubFooter a {
  color: #707070;
  text-decoration: underline;
}

#hubContainer {
  height: 100%;
}

#reportShareButtonContainer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding-right: 9em;
  position: relative;
  top: 9em;
}

#reportShareButtonContainer button {
  background: #3c3c3c87;
  width: 188px;
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  height: 44px;
  border-radius: 20px;
  border: none;
  margin-top: 24px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  color: white;
  cursor: pointer;
}

@media (max-width: 1281px) {
  #reportShareButtonContainer {
    padding-right: 3em;
  }
}

@media (max-width: 905px) {
  #reportShareButtonContainer {
    top: 0em;
  }
}

.backgroundIndex {
  @include backgroundLeftPoint(26%, 20vh);
}

.backgroundReport {
  @include backgroundRightPoint(80%, 37vh);
}

#bottomWrapper {
  color: white;
}

#bottomWrapper,
#toolkitWrapper {
  animation-name: slideup;
  animation-duration: 300ms;
  grid-column: 1 / span 12;
}

main {
  @include grid;

  margin-bottom: 2em;
}

h2 {
  margin-top: 0em;
  margin-bottom: 17px;

  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 54px;
  letter-spacing: -0.02em;
  height: 36px;
}

#inputSection {
  grid-column: 1 / span 12;
  max-width: 800px;

  color: white;

  display: grid;
  grid-template-rows: 70% 30%;

  #topHalfHome {
    grid-row: 1;

    margin-top: 68px;

    form {
      display: flex;

      &.formErr {
        animation: shake 0.2s ease-in-out 0s 2;
      }
    }

    input {
      background: transparent;

      padding-top: 13px;
      padding-bottom: 12px;
      border: none;
      border-bottom: solid 1px rgba(255, 255, 255, 0.4);
      margin-right: 0.3em;
      margin-top: 20px;
      outline: none;

      font-style: normal;
      font-weight: normal;
      font-size: 16px;
      line-height: 33px;
      color: rgba(255, 255, 255, 0.7);

      &::placeholder {
        color: white;
      }

      &:hover,
      &:focus {
        border-bottom: solid 1px white;
        color: white !important;
      }
    }

    #getStartedButton {
      border: none;
      border-radius: 22px;
      background: linear-gradient(to right, white, rgba(255, 255, 255, 0.7));
      color: #3c3c3c;
      align-self: flex-end;
      display: flex;
      flex-direction: row;
      justify-content: center;

      height: 40px;
      padding-left: 20px;
      padding-right: 20px;
      font-family: Poppins;
      font-style: normal;
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;
      display: flex;
      align-items: center;
      text-align: center;
    }
  }

  @media (max-height: 375px) {
    #topHalfHome {
      margin-top: 24px;
    }
  }

  @media (max-height: 320px) {
    #topHalfHome {
      margin-top: 4px;
    }
  }

  @media (max-width: 425px) {
    #topHalfHome {
      padding-left: 25px;
      padding-right: 25px;
    }
  }

  footer {
    position: absolute;
    bottom: 10px;
    margin-right: 32px;
    color: rgba(60, 60, 60, 0.6);
    background: transparent;

    p {
      text-align: center;
      font-size: 12px;
      line-height: 18px;
    }

    a {
      box-shadow: none;
      color: inherit;
      text-decoration: underline;
    }
  }

  @media (max-width: 425px) {
    footer {
      margin-right: initial;
      margin-left: initial;
    }
    footer p {
      width: 75%;
      margin-bottom: 0px;
    }
  }

  #bottomHalfHome {
    grid-row: 2;

    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 34px;
    position: absolute;
    bottom: 10px;

    color: #333333;

    #expertModeBlock {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      margin-top: 180px;
      margin-right: 3em;

      #expertModeButton {
        --color-stop-hub: #1fc2c8;
        --color-start-hub: #9337d8;

        width: 136px;
        font-weight: 500;
        font-size: 14px;
        font-family: "Poppins", sans-serif;
        border: none;
        border-radius: 22px;
        padding-top: 9px;
        padding-bottom: 11px;
        background-image: linear-gradient(
          to right,
          var(--color-stop-hub),
          var(--color-start-hub)
        );
        color: white;
        height: 42px;

        transition: --color-stop-hub 0.3s, --color-start-hub 0.3s;
      }

      #expertModeButton:hover {
        --color-stop-hub: #9337d8;
        --color-start-hub: #1fc2c8;
      }

      p {
        margin-top: 9px;
        font-size: 14px;
        text-align: center;
      }
    }

    @media (max-width: 1280px) {
      #expertModeBlock {
        margin-top: 80px;
      }
    }

    @media (max-width: 425px) {
      #expertModeBlock {
        margin-top: 180px;
        margin-right: initial;
      }
    }
  }
}

@media (max-width: 425px) {
  #inputSection {
    display: initial;
  }

  main {
    display: initial;
  }

  #inputSection #bottomHalfHome {
    width: initial;
  }

  footer {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

#infoSection {
  grid-column: 1 / span 5;

  color: white;

  margin-bottom: 24px;

  @media (max-width: 900px) {
    grid-column: 1 / span 12;
  }
}

#scoreCard {
  margin-bottom: 20px;
}

@media (max-width: 425px) {
  #attachSection {
    margin-left: 25px;
    margin-right: 25px;
  }

  #infoSection {
    margin-left: 25px;
    margin-right: 25px;
  }

  #scoreCard {
    margin-left: 25px;
    margin-right: 25px;
    margin-bottom: 20px;
  }

  #toolkitSection {
    margin-left: 25px;
    margin-right: 25px;
  }

  .topFeatures {
    margin-left: 25px;
    margin-right: 25px;
  }

  #hubFooter {
    padding-left: 25px;
    padding-right: 25px;
    text-align: center;
    background: transparent;
  }

  #tabsBar {
    display: none;
  }

  #subHeader #scoreZone {
    display: flex;
    justify-content: space-around;
    height: 95%;
  }
}

#infoSection p {
  font-family: "Open Sans", sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 28px;
}

.scoreCard {
  grid-column: span 4;

  @media (max-width: 900px) {
    grid-column: 1 / span 12;
  }
}

.firstCard {
  grid-column: 1 / span 4;

  @media (max-width: 900px) {
    grid-column: 1 / span 12;
  }
}

#toolkitSection {
  grid-column: 1 / span 5;

  margin-top: 76px;
  display: flex;
  align-items: center;

  a {
    margin-left: 10px;
    color: black;
    text-transform: uppercase;
    font-size: 12px;
    font-weight: bold;
    border-bottom: solid 2px;
  }

  a:hover {
    box-shadow: none;
  }
}

@media (max-height: 924px) {
  #toolkitSection {
    margin-top: 36px;
  }
}

.topFeatures {
  grid-column: span 3;

  margin-bottom: 2em;

  .card {
    height: 252px;
  }

  @media (max-width: 900px) {
    grid-column: span 6;
  }
}

.firstFeature {
  grid-column: 1 / span 3;

  @media (max-width: 900px) {
    grid-column: 1 / span 6;
  }
}

#moreFeaturesBlock {
  grid-column: 1 / span 12;

  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  a {
    background: rgba(60, 60, 60, 0.6);
    color: white;
    border-radius: 20px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-left: 20px;
    padding-right: 20px;
    font-family: Poppins;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
  }
}

#urlErr {
  height: 1em;
  font-weight: 500;
  padding-top: 1em;
  padding-bottom: 1em;
}

.btnErr {
  width: 42px !important;
  padding: 0px !important;
}

.btnErrText {
  visibility: hidden;

  &:after {
    content: "!";
    color: red;
    font-weight: bold;
    display: block;
    position: relative;
    visibility: visible;
    top: -11px;
    left: 1px;
  }
}

@keyframes slideup {
  from {
    opacity: 0;
    transform: translateY(200px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0% {
    margin-left: 0rem;
  }
  25% {
    margin-left: 0.5rem;
  }
  75% {
    margin-left: -0.5rem;
  }
  100% {
    margin-left: 0rem;
  }
}

.btnErr {
  width: 42px !important;
  padding: 0px !important;
}

.btnErrText {
  visibility: hidden;

  &:after {
    content: "!";
    color: red;
    font-weight: bold;
    display: block;
    position: relative;
    visibility: visible;
    top: -11px;
    left: 1px;
  }
}

@keyframes slideup {
  from {
    opacity: 0;
    transform: translateY(200px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0% {
    margin-left: 0rem;
  }
  25% {
    margin-left: 0.5rem;
  }
  75% {
    margin-left: -0.5rem;
  }
  100% {
    margin-left: 0rem;
  }
}

@media (max-height: 600px) {
  .backgroundIndex {
    @include backgroundLeftPoint(30%, 0vh);
  }

  .backgroundReport {
    @include backgroundRightPoint(80%, 25vh);
  }

  footer {
    display: none;
  }
}

@media (max-height: 475px) {
  .backgroundReport {
    @include backgroundRightPoint(80%, 0vh);
  }
}
</style>
