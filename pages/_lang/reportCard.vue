
<template>
  <main>
    <!--<div class="mastHead">
      <h2>You're already on your way to creating a pwa!</h2>
      <p>
        We've had a look over your site and it's looking good. 
        You've already got a manifest, which forms the base of a PWA,
        but we highly recommend you add some features like 
        Service Workers to make the experience even better for your users.
      </p>
    </div>

    <div class="chooseContainer">
      <h2>Your App Results</h2>
      <GoodPWA :isHttps="true" :allGoodWithText="true" />
    </div>-->
    <div id="scoreSideBySide">
      <section id="headerSection">
        <div>
          <h1 id="reportCardHeader">Report Card</h1>

          <p id="urlTested">URL Tested: {{url}}</p>

          <p id="reportCardInfo">
            See how well your website supports PWA features and learn how to improve your website's score by addressing the feedback below.
            Click Build to let us help you add what you need. When you've pushed your changes,
            try re-scanning your website to track your progress.
          </p>

          <div id="reportActionsBlock">
            <button @click="rescan()" id="rescanButton">Rescan</button>
            <nuxt-link id="publishButton" to="/publish">Build My App</nuxt-link>
          </div>
        </div>
      </section>

      <section id="scoreSection">
        <!--<img id="reportGraphic" src="~/assets/images/report_card.svg">-->
        <div id="scoreDiv" v-if="!calcGradeAnalyzing">{{overallGrade}}</div>
        <div id="scoreDiv" v-if="calcGradeAnalyzing">
          <Loading active></Loading>
        </div>
      </section>
    </div>

    <div id="catsContainer">
      <section id="cats">
        <section class="catSection">
          <div class="catHeader">
            <h2>Manifest</h2>

            <span v-if="!manifestAnalyzing" class="score">
              {{manifestScore}}
              <span class="scoreSubText">out of 100</span>
            </span>
            
            <span v-if="manifestAnalyzing" class="score">
              <Loading active class="u-display-inline_block u-margin-left-sm"/>
            </span>
          </div>

          <ul v-if="manifest">
            <li v-bind:class="{ good: manifest }">
              <i v-if="manifest" class="fas fa-check"></i>
              <i v-if="!manifest" class="fas fa-times"></i>
              
              <span>Has a Web Manifest</span>
            </li>
            <li v-bind:class="{ good: manifest && manifest.display }">
              <i v-if="manifest && manifest.display" class="fas fa-check"></i>
              <i v-if="manifest && !manifest.display" class="fas fa-times"></i>
              
              <span>Has the display property</span>
            </li>
            <li v-bind:class="{ good: manifest && manifest.icons }">
              <i v-if="manifest && manifest.icons" class="fas fa-check"></i>
              <i v-if="manifest && !manifest.icons" class="fas fa-times"></i>
              
              <span>Has the icons Property</span>
            </li>
            <li v-bind:class="{ good: manifest && manifest.name }">
              <i v-if="manifest && manifest.name" class="fas fa-check"></i>
              <i v-if="manifest && !manifest.name" class="fas fa-times"></i>
              
              <span>Has the app_name property</span>
            </li>
            <li v-bind:class="{ good: manifest && manifest.short_name }">
              <i v-if="manifest && manifest.short_name" class="fas fa-check"></i>
              <i v-if="manifest && !manifest.short_name" class="fas fa-times"></i>
              
              <span>Has the short_name property</span>
            </li>
            <li v-bind:class="{ good: manifest && manifest.start_url }">
              <i v-if="manifest && manifest.start_url" class="fas fa-check"></i>
              <i v-if="manifest && !manifest.start_url" class="fas fa-times"></i>
              
              <span>Has the start_url property</span>
            </li>
          </ul>
          <ul v-else>
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

          <!--<button>Edit</button>-->
          <div class="editDiv">
            <nuxt-link class="editButton" to="generate">Edit</nuxt-link>
          </div>
        </section>

        <section class="catSection">
          <!--<h2>Service Worker</h2>

        <span v-if="!swAnalyzing" class="score">
          {{swScore}}
          <span class="scoreSubText">out of 100</span>
        </span>
        <span v-if="swAnalyzing" class="score">
          <Loading active class="u-display-inline_block u-margin-left-sm"/>
          </span>-->
          <div class="catHeader">
            <h2>Service Worker</h2>

            <span v-if="!swAnalyzing" class="score">
              {{swScore}}
              <span class="scoreSubText">out of 100</span>
            </span>
            
            <span v-if="swAnalyzing" class="score">
              <Loading active class="u-display-inline_block u-margin-left-sm"/>
            </span>
          </div>

          <ul v-if="serviceWorkerData">
            <li v-bind:class="{ good: serviceWorkerData.hasSW }">
              <i
                v-bind:class="{'fas fa-check': serviceWorkerData.hasSW, 'fas fa-times': !serviceWorkerData.hasSW}"
              ></i>
              
              <span>Has a Service Worker</span>
            </li>
            <li v-bind:class="{ good: serviceWorkerData.cache }">
              <i
                v-bind:class="{'fas fa-check': serviceWorkerData.cache, 'fas fa-times': !serviceWorkerData.cache}"
              ></i>
              
              <span>Service Worker has cache handlers</span>
            </li>
            <li v-bind:class="{ good: serviceWorkerData.scope }">
              <i
                v-bind:class="{'fas fa-check': serviceWorkerData.scope, 'fas fa-times': !serviceWorkerData.scope}"
              ></i>
              
              <span>Service Worker has the correct scope</span>
            </li>
            <li v-bind:class="{ good: serviceWorkerData.pushReg }">
              <i
                v-bind:class="{'fas fa-check': serviceWorkerData.pushReg, 'fas fa-times': !serviceWorkerData.pushReg}"
              ></i>
              
              <span>Service Worker has a push registration</span>
            </li>
          </ul>
          <ul v-else>
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

          <!--<button>Edit</button>-->
          <div class="editDiv">
            <nuxt-link to="serviceworker" class="editButton">Edit</nuxt-link>
          </div>
        </section>

        <section class="catSection">
          <div class="catHeader">
            <h2>Security</h2>

            <span v-if="!securityAnalyzing" class="score">
              {{securityScore}}
              <span class="scoreSubText">out of 100</span>
            </span>
            <span v-if="securityAnalyzing" class="score">
              <Loading active class="u-display-inline_block u-margin-left-sm"/>
            </span>
          </div>

          <ul>
            <li>
              <i class="fas fa-check"></i>
              <span>Has HTTPS</span>
            </li>
          </ul>
        </section>

        <section class="catSection">
          <h2>Extras</h2>

          <p>
            Add extra features to your PWA to enable
            extra functionality!
          </p>

          <div class="editDiv">
            <nuxt-link to="windows" class="editButton">Add More</nuxt-link>
          </div>
        </section>
      </section>
    </div>
  </main>
</template>



<script lang='ts'>
import Vue from "vue";
// import axios from "axios";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

import GoodPWA from "~/components/GoodPWA.vue";
import Loading from "~/components/Loading.vue";

import * as generator from "~/store/modules/generator";

const GeneratorState = namespace(generator.name, State);
const GeneratorAction = namespace(generator.name, Action);

const apiUrl = `${
  process.env.apiUrl
}/serviceworkers/getServiceWorkerFromUrl?siteUrl`;

@Component({
  components: {
    GoodPWA,
    Loading
  }
})
export default class extends Vue {
  @GeneratorState url: string;
  @GeneratorState manifest: any;

  @GeneratorAction getManifestInformation;

  swScore = 0;
  manifestScore = 0;
  securityScore = 0;
  overallGrade: string | null = null;

  swAnalyzing = false;
  manifestAnalyzing = false;
  securityAnalyzing = false;
  calcGradeAnalyzing = false;

  serviceWorkerData: any = null;

  abortController: AbortController;

  public async created(): Promise<void> {
    console.log("Created called");
    await this.start();
  }

  public mounted() {
    if ("AbortController" in window) {
      this.abortController = new AbortController();
    }
  }

  public beforeDestroy() {
    console.log("navigating away form reportCard page");
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  private async start() {
    if (this.url) {
      console.log("here");
      // this.analyzing = true;
      this.securityAnalyzing = true;
      this.manifestAnalyzing = true;
      this.swAnalyzing = true;
      this.calcGradeAnalyzing = true;

      await this.lookAtSecurity();
      await this.lookAtManifest();
      await this.lookAtSW();
      await this.calcGrade();

      console.log(this.overallGrade);

      // this.analyzing = false;
    }
  }

  private lookAtSecurity(): Promise<void> {
    return new Promise(resolve => {
      if (this.url.includes("https")) {
        this.securityScore = this.securityScore + 100;
      }

      this.securityAnalyzing = false;
      console.log(1);
      resolve();
    });
  }

  private lookAtManifest(): Promise<void> {
    return new Promise(async resolve => {
      await this.getManifestInformation();

      console.log("manifestInfo", this.manifest);
      if (this.manifest) {
        this.manifestScore = this.manifestScore + 50;
      }

      if (this.manifest.display !== undefined) {
        this.manifestScore = this.manifestScore + 10;
      }

      if (this.manifest.icons !== undefined) {
        this.manifestScore = this.manifestScore + 10;
      }

      if (this.manifest.name !== undefined) {
        this.manifestScore = this.manifestScore + 10;
      }

      if (this.manifest.short_name !== undefined) {
        this.manifestScore = this.manifestScore + 10;
      }

      if (this.manifest.start_url !== undefined) {
        this.manifestScore = this.manifestScore + 10;
      }

      this.manifestAnalyzing = false;

      console.log(2);

      resolve();
    });
  }

  private async lookAtSW(): Promise<void> {
    if (this.url) {
      if (this.abortController) {
        const signal = this.abortController.signal;
        // const data = await axios.get(`${apiUrl}=${this.url}`, { signal });
        console.log('fetching sw');
        const response = await fetch(`${apiUrl}=${this.url}`, { signal });
        const data = await response.json();
        console.log("lookAtSW", data);

        this.serviceWorkerData = data;
      } else {
        const response = await fetch(`${apiUrl}=${this.url}`);
        const data = await response.json();
        console.log("lookAtSW", data.data);

        this.serviceWorkerData = data;
      }

      /*
        Has service worker
        +50 points to user
      */
      if (this.serviceWorkerData.hasSW !== null) {
        this.swScore = this.swScore + 50;
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
          this.swScore = this.swScore + 30;
        }
      }

      /*
        Has push reg
        +10 points to user
      */
      if (this.serviceWorkerData.pushReg !== null) {
        this.swScore = this.swScore + 10;
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
        this.swScore = this.swScore + 10;
      }
    }

    console.log(3);

    this.swAnalyzing = false;
  }

  private calcGrade() {
    return new Promise(resolve => {
      if (
        this.swScore > 90 &&
        this.manifestScore > 90 &&
        this.securityScore > 90
      ) {
        this.overallGrade = "A";
      } else if (
        this.swScore > 80 &&
        this.manifestScore > 80 &&
        this.securityScore > 80
      ) {
        this.overallGrade = "B";
      } else if (
        this.swScore > 70 &&
        this.manifestScore > 70 &&
        this.securityScore > 70
      ) {
        this.overallGrade = "C";
      } else {
        this.overallGrade = "D";
      }

      this.calcGradeAnalyzing = false;

      sessionStorage.setItem("overallGrade", this.overallGrade);

      resolve();
    });
  }

  public async rescan(): Promise<void> {
    // reset scores and rescan the site
    this.securityAnalyzing = true;
    this.manifestAnalyzing = true;
    this.swAnalyzing = true;
    this.calcGradeAnalyzing = true;

    this.manifestScore = 0;
    this.swScore = 0;
    this.securityScore = 0;

    try {
      await this.getManifestInformation();
      await this.start();
    } catch (e) {
      console.error(e);
    }
  }
}
</script>

<style lang="scss" scoped>
/* stylelint-disable */
@import "~assets/scss/base/variables";

/*.mastHead {
  margin-bottom: 12em;
}

.chooseContainer {
  margin-top: 118px;

  h2 {
    margin-left: 68px;
    margin-bottom: 28px;
  }
}*/

#gradeLoading {
  display: flex;
  justify-content: center;
}

.skeletonSpan {
  background-image: linear-gradient(to right, grey, white);
  width: 40%;
  display: block;
  height: 1em;
  opacity: 0.6;
  margin: 5px;
}

#scoreSideBySide {
  display: flex;
  height: 34em;

  section {
    flex: 1;
  }

  #headerSection {
    padding-top: 4em;

    #urlTested {
      font-weight: bold;
      margin-top: 0;
      margin-bottom: 1em;
    }

    div {
      padding-left: 8em;
    }

    #reportActionsBlock {
      display: flex;
      padding-left: 0;
    }

    #reportCardHeader {
      font-weight: bold;
      font-size: 48px;
    }

    #reportCardInfo {
      width: 376px;
    }

    #rescanButton {
      width: 184px;
      border-radius: 22px;
      border: none;
      background: grey;
      font-weight: bold;
      font-size: 18px;
      padding-top: 9px;
      padding-bottom: 11px;
      margin-top: 40px;
      color: white;
      background: $color-button-primary-blue-variant;
      margin-left: 8px;
      margin-right: 10px;
    }

    #publishButton {
      width: 184px;
      border-radius: 22px;
      border: none;
      background: grey;
      font-weight: bold;
      font-size: 18px;
      padding-top: 9px;
      padding-bottom: 11px;
      margin-top: 40px;
      color: white;
      background: $color-button-primary-green-variant;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  #scoreSection {
    background: #8148cd;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100%;

    img {
      position: absolute;
      top: -25em;
      right: -2.2em;
      bottom: 0;
      z-index: -2;
      bottom: 0;
    }

    #scoreDiv {
      height: 210px;
      width: 261px;
      background: white;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 92px;
      font-weight: bold;
      border-radius: 20px;
      margin-bottom: 1.2em;

      section {
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}

#catsContainer {
  padding-left: 8em;
  padding-right: 8em;
  position: relative;
  bottom: 4em;
}

#cats {
  /*margin-left: 9em;
  margin-right: 9em;
  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: auto auto;
  position: relative;
  bottom: 4.6em;*/

  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: auto auto;

  .good {
  }

  .catSection {
    border: solid 1px grey;
    padding: 40px;
    background: white;
    display: flex;
    flex-direction: column;
    min-height: 366px;

    .catHeader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1em;
    }

    @media (max-width: 1300px) {
      .catHeader {
        width: 29em;
      }
    }

    ul {
      flex-grow: 2;
      list-style: none;
      padding: 0;
      margin: 0;
      margin-bottom: 42px;

      li {
        font-size: 18px;
        padding: 0.1em;

        span {
          margin-left: 20px;
        }
      }
    }

    h2 {
      font-size: 24px;
      font-weight: bold;
      width: 420px;
    }

    .editButton {
      width: 184px;
      border-radius: 22px;
      border: none;
      background: grey;
      font-weight: bold;
      font-size: 18px;
      padding-top: 9px;
      padding-bottom: 11px;
      display: flex;
      justify-content: center;
      color: white;
      background: $color-button-primary-green-variant;
    }

    .score {
      font-size: 36px;
      font-weight: bold;
      display: flex;
      width: 2.8em;
      justify-content: space-between;

      .scoreSubText {
        color: grey;
        font-size: 12px;
        width: 32px;
        text-align: center;
      }
    }
  }
}

/*@media (max-width: 1580px) {
  #scoreDiv {
    top: -0.4em !important;
    right: -0.14em !important;
  }
}

@media (max-width: 1450px) {
  #scoreDiv {
    top: -0.8em !important;
  }
}

@media (max-width: 1370px) {
  #scoreDiv {
    top: -1em !important;
  }
}

@media (max-width: 1300px) {
  #scoreDiv {
    top: -1.6em !important;
  }

  #cats {
    margin-left: 6em;
    margin-right: 6em;
  }
}*/
</style>

