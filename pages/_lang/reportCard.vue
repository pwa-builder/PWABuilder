
<template>
  <div id="hubContainer">
    <HubHeader :score="overallScore" :showSubHeader="gotURL"></HubHeader>

    <main>
      <div v-if="!gotURL" id="inputSection">
        <h2>Enter a URL to test your PWA</h2>

        <form @submit.prevent="checkUrlAndGenerate" @keydown.enter.prevent="checkUrlAndGenerate">
          <input
            id="getStartedInput"
            :aria-label="$t('generator.url')"
            :placeholder="$t('generator.placeholder_url')"
            name="siteUrl"
            type="text"
            ref="url"
            v-model="url$"
            autofocus
          >

          <button
            @click=" $awa( { 'referrerUri': 'https://www.pwabuilder.com/build/reportCard' })"
            id="getStartedButton"
          >
            <div>{{ $t('generator.start') }}</div>
          </button>

          <div id="urlErr">{{this.error}}</div>
        </form>

        <div id="backToOld">
          Having issues with the new version of PWABuilder? Use the previous version
          <a
            href="https://manifold-site-prod.azurewebsites.net/"
          >here</a>
          and consider opening an issue on our
          <a
            href="https://github.com/pwa-builder/PWABuilder"
          >Github</a>.
          Thanks!
        </div>

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

      <section v-if="gotURL" id="bottomWrapper">
        <div id="infoSection">
          <h2>Hub</h2>

          <p>
            We have taken a look at how well your website supports PWA features and provided simple tools to help you fill in the gaps.
            When you’re ready, click “build my PWA” to finish up.
          </p>
        </div>

        <div class="cardBlock">
          <ScoreCard
            v-on:manifestTestDone="manifestTestDone($event)"
            :url="url"
            category="Manifest"
          ></ScoreCard>
          <ScoreCard
            v-on:serviceWorkerTestDone="swTestDone($event)"
            :url="url"
            category="Service Worker"
          ></ScoreCard>
          <ScoreCard
            class="middleCard"
            v-on:securityTestDone="securityTestDone($event)"
            :url="url"
            category="Security"
          ></ScoreCard>
        </div>
      </section>

      <section v-if="topSamples.length > 0" id="toolkitWrapper">
        <div id="toolkitSection">
          <h2>PWA Toolkit</h2>
        </div>

        <div class="cardBlock">
          <!-- replace score cards with feature cards, this is just to get the UI right -->
          <!--<ScoreCard></ScoreCard>
          <ScoreCard></ScoreCard>
          <ScoreCard></ScoreCard>-->
          <FeatureCard
            class="topFeatures"
            v-if="topSamples.length > 0"
            v-for="sample in topSamples"
            :sample="sample"
            :key="sample.id"
            :showAddButton="true"
          ></FeatureCard>
        </div>

        <div id="moreFeaturesBlock">
          <nuxt-link to="/features">
            View More
            <i class="fas fa-angle-right"></i>
          </nuxt-link>
        </div>
      </section>
    </main>
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

    if (this.url$) {
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
  }

  public manifestTestDone(ev) {
    console.log("manifest test done", ev);
    this.overallScore = this.overallScore + ev.score;
  }

  public swTestDone(ev) {
    console.log("sw test is done", ev);
    this.overallScore = this.overallScore + ev.score;
    console.log(this.overallScore);
  }
}
</script>

<style lang="scss" scoped>
/* stylelint-disable */
@import "~assets/scss/base/variables";

.topFeatures {
  margin-bottom: 2em;

  .card {
    height: 252px;
    width: 266px;
  }
}

main {
  padding-left: 159px;
  padding-right: 159px;
  height: 105vh;
}

#hubContainer {
  background-image: url("~/assets/images/background.svg");
  background-position: top center;
  background-repeat: no-repeat;
  background-color: #f0f0f0;
  height: 138vh;
}

#bottomWrapper {
  color: white;
}

#bottomWrapper,
#toolkitWrapper {
  animation-name: slideup;
  animation-duration: 300ms;
}

.cardBlock {
  display: flex;
  justify-content: space-between;
}

#toolkitSection {
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

#infoSection h2 {
  margin-top: 36px;
}

h2 {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 17px;
}

p {
  width: 395px;
  margin-bottom: 30px;
}

#inputSection {
  width: 20em;
  margin-top: 100px;
  color: white;

  #backToOld {
    font-size: 12px;
    line-height: 18px;
    margin-top: 20px;
    margin-bottom: 0px;

    a {
      color: inherit;
      box-shadow: none;
      color: inherit;
      text-decoration: underline;
    }
  }

  #expertModeBlock {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-top: 65px;
    margin-right: 1em;

    #expertModeButton {
      width: 200px;
      font-weight: bold;
      font-size: 18px;
      border: none;
      border-radius: 22px;
      padding-top: 9px;
      padding-bottom: 11px;
      background-image: linear-gradient(to right, #7644c2, #11999e);
      color: white;
      height: 44px;
    }

    p {
      margin-top: 9px;
      font-size: 14px;
      text-align: center;
    }
  }

  footer {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  footer p {
    text-align: center;
    width: 320px;
    font-size: 12px;
    color: white;
    line-height: 18px;
    margin-right: 2em;
  }

  form {
    display: flex;
  }

  input {
    padding-top: 13px;
    padding-bottom: 12px;
    font-weight: bold;
    font-size: 18px;
    border: none;
    width: 24em;
    margin-right: 0.3em;
    margin-top: 20px;
    outline: none;
    border-radius: 24px;
    padding-left: 14px;
  }

  input:focus {
    border-bottom: solid 1px rgba(60, 60, 60, 1);
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
    background: grey;
    height: 44px;
    align-self: flex-end;
    display: flex;
    flex-direction: row;
    align-items: center;
    background: $color-button-primary-purple-variant;
    color: white;
    width: 88px;
    justify-content: center;
  }
}

#moreFeaturesBlock {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  a {
    color: #3c3c3c;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 14px;
    border: solid 1px #e2e2e2;
    border-radius: 24px;
    padding: 10px;
  }
}

footer a {
  box-shadow: none;
}

#urlErr {
  color: red;
  margin-top: 1em;
  margin-left: 1em;
}

@media (min-width: 1400px) {
  #hubContainer {
    height: 120vh;
  }

  #toolkitSection {
    margin-top: 70px;
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
</style>

