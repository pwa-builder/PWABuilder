
<template>
  <div id="hubContainer"
       :class="{ 'backgroundReport': gotURL, 'backgroundIndex': !gotURL }">
    <HubHeader :score="overallScore" :showSubHeader="gotURL" :expanded="!gotURL"></HubHeader>

    <main>
      <div v-if="!gotURL" id="inputSection">
        <div id="topHalfHome">
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
        <h2>Add app features...</h2>
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

      <div id="moreFeaturesBlock" 
           v-if="topSamples.length > 0">
        <nuxt-link to="/features">
          View More
          <i class="fas fa-angle-right"></i>
        </nuxt-link>
      </div>
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

#hubContainer {
  height: 100vh;
}

.backgroundIndex {
  @include backgroundLeftPoint(20%, 50vh);
}

.backgroundReport {
  @include backgroundRightPoint(80%, 50vh);
}

@media (min-width: 1336px) {
  #hubContainer {
    height: 128vh;
  }  

  .backgroundIndex {
    @include backgroundLeftPoint(30%, 80vh);
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

/* horizontal bar after heading */
h2:after {
  content: "";
  display: block;

  width: 19%; /* TODO: Not part of Grid */
  padding-top: 17px;
  border-bottom: solid 1px rgba(255, 255, 255, 0.3);
}

#inputSection {
  grid-column: 1 / span 5;

  color: white;

  display: grid;
  grid-template-rows: 70% 30%;

  #topHalfHome {
    grid-row: 1;

    form {
      display: flex;
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

      &:hover, &:focus {
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
      color: #3C3C3C;
      height: 44px;
      align-self: flex-end;
      display: flex;
      flex-direction: row;
      align-items: center;      
      width: 88px;
      justify-content: center;
    }

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
  }

  #bottomHalfHome {
    grid-row: 2;

    color: #333333;

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

      color: rgba(60, 60, 60, 0.6);
      
      p {
        text-align: center;
        width: 320px;
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
  }
}

#infoSection {
  grid-column: 1 / span 5;

  color: white;
}

.scoreCard {
  grid-column: span 4;
}

.firstCard {
  grid-column: 1 / span 4;
}

#toolkitSection {
  grid-column: 1/ span 5;

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
}

.firstFeature {
  grid-column: 1 / span 3;
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
  color: red;
  margin-top: 1em;
  margin-left: 1em;
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

