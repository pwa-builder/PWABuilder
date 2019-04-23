
<template>
  <div id="hubContainer" :class="{ 'backgroundReport': gotURL, 'backgroundIndex': !gotURL }">
    <HubHeader
      v-on:reset="reset()"
      :score="overallScore"
      :showSubHeader="gotURL"
      :expanded="!gotURL"
    ></HubHeader>

    <main>
      <div v-if="!gotURL" id="inputSection">
        <div id="topHalfHome">
          <h1>Quickly and easily turn your website into an app!</h1>

          <p>It's super easy to get started. Just enter the URL of your website below</p>

          <div id="urlErr">{{ $t(this.error) }}</div>

          <form
            @submit.prevent="checkUrlAndGenerate"
            @keydown.enter.prevent="checkUrlAndGenerate"
            :class="{ 'formErr': error != null }"
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
            >

            <button
              @click=" $awa( { 'referrerUri': 'https://www.pwabuilder.com/build/reportCard' })"
              :class="{ 'btnErr': error != null }"
              id="getStartedButton"
            >
              <div :class="{ 'btnErrText': error != null }">{{ $t('generator.start') }}</div>
            </button>
          </form>
        </div>

        <div id="bottomHalfHome">
          <div id="expertModeBlock">
            <button @click="skipCheckUrl()" id="expertModeButton">Expert Mode</button>
            <p>Already have a PWA? Skip ahead!</p>
          </div>

          <footer>
            <p>
              PWA Builder was founded by Microsoft as a community guided, open source project to help move PWA adoption forward.
              <a
                href="https://privacy.microsoft.com/en-us/privacystatement#maincookiessimilartechnologiesmodule"
              >Our Privacy Statement</a>
            </p>
          </footer>
        </div>
      </div>

      <div v-if="gotURL" id="infoSection">
        <h2>Hub</h2>

        <p>
          We have taken a look at how well your website supports PWA features and provided simple tools to help you fill in the gaps.
          When you’re ready, click “build my PWA” to finish up.
        </p>
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
        :class="{ 'firstFeature' : index === 0 }"
        :sample="sample"
        :key="sample.id"
        :showAddButton="true"
      >
        <i slot="iconSlot" class="fas fa-rocket"></i>
      </FeatureCard>

      <div id="moreFeaturesBlock" v-if="topSamples.length > 0">
        <nuxt-link to="/features">
          View More
          <i class="fas fa-angle-right"></i>
        </nuxt-link>
      </div>
    </main>

    <footer v-if="gotURL" id="hubFooter">
      <p>
        PWA Builder was founded by Microsoft as a community guided, open source project to help move PWA adoption forward.
        <a
          href="https://privacy.microsoft.com/en-us/privacystatement#maincookiessimilartechnologiesmodule"
        >Our Privacy Statement</a>
      </p>
    </footer>
  </div>
</template>



<script lang='ts'>
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

  public async created() {
    this.url$ = this.url;

    if (this.url$ || this.url) {
      this.gotURL = true;
      this.getTopSamples();
    }
  }

  public async checkUrlAndGenerate() {
    this.error = null;

    console.log("here");

    try {
      console.log("in try block");
      await this.updateLink(this.url$);
      this.url$ = this.url;

      this.gotURL = true;

      this.getTopSamples();
    } catch (err) {
      console.error("url error", err);

      if (err.message) {
        this.error = err.message;
      } else {
        // No error message
        // so just show error directly
        this.error = err;
      }
    }
  }

  public async getTopSamples() {
    await this.getSamples();
    console.log(this.samples);
    const cleanedSamples = this.samples.slice(0, 4);
    console.log("cleanedSamples", cleanedSamples);

    this.topSamples = cleanedSamples;
  }

  public securityTestDone(ev) {
    console.log("testDone", ev);
    this.overallScore = this.overallScore + ev.score;
    console.log(this.overallScore);
  }

  public manifestTestDone(ev) {
    console.log("manifest test done", ev);
    this.overallScore = this.overallScore + ev.score;
    console.log(this.overallScore);
  }

  public swTestDone(ev) {
    console.log("sw test is done", ev);
    this.overallScore = this.overallScore + ev.score;
    console.log(this.overallScore);
  }

  public reset() {
    console.log("resetting");
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
</script>

<style lang="scss" scoped>
/* stylelint-disable */
@import "~assets/scss/base/variables";

#hubFooter {
  display: flex;
  justify-content: center;
  padding-left: 16em;
  padding-right: 16em;
  font-size: 12px;
  color: rgba(60, 60, 60, 0.5);
}

#hubContainer {
  height: 100vh;
}

.backgroundIndex {
  @include backgroundLeftPoint(20%, 40vh);
}

.backgroundReport {
  @include backgroundRightPoint(80%, 40vh);
}

@media (min-width: 1336px) {
  #hubContainer {
    height: 128vh;
  }

  .backgroundIndex {
    @include backgroundLeftPoint(26%, 70vh);
  }

  .backgroundReport {
    @include backgroundRightPoint(80%, 70vh);
  }
}

@media (max-height: 780px) {
  #hubContainer {
    height: 162vh;
  }

  #inputSection {
    grid-template-rows: 80% 20%;
  }

  .backgroundIndex {
    @include backgroundLeftPoint(30%, 90vh);
  }

  .backgroundReport {
    @include backgroundRightPoint(80%, 88vh);
  }
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
  margin-top: 2em;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 17px;
}

#inputSection {
  grid-column: 1 / span 5;

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
      color: white;

      padding-top: 13px;
      padding-bottom: 12px;
      font-weight: bold;
      font-size: 18px;
      border: none;
      border-bottom: solid 1px rgba(255, 255, 255, 0.4);
      margin-right: 0.3em;
      margin-top: 20px;
      outline: none;

      &::placeholder {
        color: white;
      }

      &:hover,
      &:focus {
        border-bottom: solid 1px white;
      }
    }

    #getStartedButton {
      border: none;
      font-weight: bold;
      font-size: 18px;
      border-radius: 22px;
      padding-top: 9px;
      padding-bottom: 11px;
      padding-left: 23px;
      padding-right: 23px;
      background: linear-gradient(to right, white, rgba(255, 255, 255, 0.7));
      border: solid 1px white;
      color: #3c3c3c;
      height: 44px;
      align-self: flex-end;
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 88px;
      justify-content: center;
    }
  }

  @media(max-width: 425px) {
    #topHalfHome {
      padding-left: 25px;
      padding-right: 25px;
    }
  }

  #bottomHalfHome {
    grid-row: 2;

    color: #333333;

    #expertModeBlock {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      margin-top: 100px;
      margin-right: 3em;

      #expertModeButton {
        width: 136px;
        font-weight: 500;
        font-size: 14px;
        font-family: "Poppins", sans-serif;
        border: none;
        border-radius: 22px;
        padding-top: 9px;
        padding-bottom: 11px;
        background-image: linear-gradient(to right, #1fc2c8, #9337d8);
        color: white;
        height: 42px;
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

    footer {
      display: flex;
      justify-content: center;
      align-items: center;

      width: 465px;
      margin-top: 86px;

      color: rgba(60, 60, 60, 0.6);

      p {
        text-align: center;
        font-size: 12px;
        line-height: 18px;
        margin-right: 2em;
      }

      a {
        box-shadow: none;

        color: inherit;

        text-decoration: underline;
      }
    }

    @media (max-width: 425px) {
      footer p {
        width: 62%;
        margin-right: 4em;
      }
    }

    @media (max-width: 1280px) {
      footer {
        margin-top: 56px;
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
}

#infoSection {
  grid-column: 1 / span 5;

  color: white;

  margin-bottom: 24px;

  @media (max-width: 900px) {
    grid-column: 1 / span 12;
  }
}

#infoSection p {
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

  margin-top: 36px;
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
    color: #9b47db;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 14px;
    border: solid 1px #9337d8;
    border-radius: 24px;
    padding: 10px;
  }
}

#urlErr {
  height: 1em;
  font-weight: 500;
  padding-top: 1em;
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
</style>

