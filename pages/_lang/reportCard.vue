
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
      <nuxt-link to="/">
        <header>
          <img id="logo" src="~/assets/images/logo.png">
        </header>
      </nuxt-link>

      <section id="headerSection">
        <div class="mast">
          <h1 id="reportCardHeader">How am I doing so far?</h1>

          <div id="urlTested">URL Tested:
            <p>{{url}}</p>
          </div>

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
        <div id="scoreDiv">
          {{overallGrade}}
          <span>overall grade</span>
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
              <span>Web Manifest properly attached</span>
              
              <span v-if="manifest">
                <i class="fas fa-check"></i>
                <span>10 pts</span>
              </span>
              <span v-if="!manifest">
                <i class="fas fa-times"></i>
                <span>0 pts</span>
              </span>
            </li>
            <li v-bind:class="{ good: manifest && manifest.display }">
              <span>Display property utilized</span>
              
              <span v-if="manifest && manifest.display">
                <i class="fas fa-check"></i>
                <span>10 pts</span>
              </span>
              <span v-if="manifest && !manifest.display">
                <i class="fas fa-times"></i>
                <span>0 pts</span>
              </span>
            </li>
            <li v-bind:class="{ good: manifest && manifest.icons }">
              <span>Lists icons for add to home screen</span>
              
              <span v-if="manifest && manifest.icons">
                <i class="fas fa-check"></i>
                <span>10 pts</span>
              </span>
              <span v-if="manifest && !manifest.icons">
                <i class="fas fa-times"></i>
                <span>0 pts</span>
              </span>
            </li>
            <li v-bind:class="{ good: manifest && manifest.name }">
              <span>Contains app_name property</span>
              
              <span v-if="manifest && manifest.name">
                <i class="fas fa-check"></i>
                <span>10 pts</span>
              </span>
              <span v-if="manifest && !manifest.name">
                <i class="fas fa-times"></i>
                <span>0 pts</span>
              </span>
            </li>
            <li v-bind:class="{ good: manifest && manifest.short_name }">
              <span>Contains short_name property</span>
              
              <span v-if="manifest && manifest.short_name">
                <i class="fas fa-check"></i>
                <span>10 pts</span>
              </span>
              <span v-if="manifest && !manifest.short_name">
                <i class="fas fa-times"></i>
                <span>0 pts</span>
              </span>
            </li>
            <li v-bind:class="{ good: manifest && manifest.start_url }">
              <span>Designates a start_url</span>
              
              <span v-if="manifest && manifest.start_url">
                <i class="fas fa-check"></i>
                <span>10 pts</span>
              </span>
              <span v-if="manifest && !manifest.start_url">
                <i class="fas fa-times"></i>
                <span>0 pts</span>
              </span>
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
            <nuxt-link class="editButton" to="generate">Edit Manifest</nuxt-link>
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
              <span>Has a Service Worker</span>
              <span v-if="serviceWorkerData && serviceWorkerData.hasSW">
                <i class="fas fa-check"></i>
                <span>10 pts</span>
              </span>
              <span v-if="serviceWorkerData && !serviceWorkerData.hasSW">
                <i class="fas fa-times"></i>
                <span>0 pts</span>
              </span>
            </li>
            <li v-bind:class="{ good: serviceWorkerData.cache }">
              <span>Service Worker has cache handlers</span>
              <span v-if="serviceWorkerData && serviceWorkerData.cache">
                <i class="fas fa-check"></i>
                <span>10 pts</span>
              </span>
              <span v-if="serviceWorkerData && !serviceWorkerData.cache">
                <i class="fas fa-times"></i>
                <span>0 pts</span>
              </span>
            </li>
            <li v-bind:class="{ good: serviceWorkerData.scope }">
              <span>Service Worker has the correct scope</span>
              <span v-if="serviceWorkerData && serviceWorkerData.scope">
                <i class="fas fa-check"></i>
                <span>10 pts</span>
              </span>
              <span v-if="serviceWorkerData && !serviceWorkerData.scope">
                <i class="fas fa-times"></i>
                <span>0 pts</span>
              </span>
            </li>
            <li v-bind:class="{ good: serviceWorkerData.pushReg }">
              <span>Service Worker has a push registration</span>
              <span v-if="serviceWorkerData && serviceWorkerData.pushReg">
                <i class="fas fa-check"></i>
                <span>10 pts</span>
              </span>
              <span v-if="serviceWorkerData && !serviceWorkerData.pushReg">
                <i class="fas fa-times"></i>
                <span>0 pts</span>
              </span>
            </li>
          </ul>

          <ul v-if="!serviceWorkerData && !noServiceWorker">
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

          <div id="noSWP" v-if="noServiceWorker">No Service Worker found</div>

          <!--<button>Edit</button>-->
          <div class="editDiv">
            <nuxt-link to="serviceworker" class="editButton">Choose Service Worker</nuxt-link>
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
              <span>Uses HTTPS URL</span>
              <span>
                <i class="fas fa-check"></i>
                <span>10 pts</span>
              </span>
            </li>
            <li>
              <span>Valid SSL certificate is use</span>
              <span>
                <i class="fas fa-check"></i>
                <span>10 pts</span>
              </span>
            </li>
            <li>
              <span>No "mixed" content on page</span>
              <span>
                <i class="fas fa-check"></i>
                <span>10 pts</span>
              </span>
            </li>
          </ul>
        </section>

        <section class="catSection">
          <h2>Extras</h2>

          <p id="extrasP">
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
  overallGrade = "i";

  swAnalyzing = false;
  manifestAnalyzing = false;
  securityAnalyzing = false;

  serviceWorkerData: any = null;
  noServiceWorker = false;

  abortController: AbortController;

  public async created(): Promise<void> {
    await this.start();
  }

  public mounted() {
    if ("AbortController" in window) {
      this.abortController = new AbortController();
    }
  }

  public beforeDestroy() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  private async start() {
    if (this.url) {
      // this.analyzing = true;
      this.securityAnalyzing = true;
      this.manifestAnalyzing = true;
      this.swAnalyzing = true;

      await this.lookAtSecurity();
      await this.lookAtManifest();
      await this.lookAtSW();
      await this.calcGrade();
    }
  }

  private lookAtSecurity(): Promise<void> {
    return new Promise(resolve => {
      if (this.url.includes("https")) {
        this.securityScore = this.securityScore + 100;
      }

      this.securityAnalyzing = false;
      this.calcGrade();
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

      this.calcGrade();

      resolve();
    });
  }

  private async lookAtSW(): Promise<void> {
    if (this.url) {
      if (this.abortController) {
        const signal = this.abortController.signal;
        // const data = await axios.get(`${apiUrl}=${this.url}`, { signal });
        console.log("fetching sw");
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

      if (this.serviceWorkerData === false) {
        this.swScore = 0;
        this.calcGrade();
        this.swAnalyzing = false;
        this.noServiceWorker = true;

        return;
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

    this.calcGrade();

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

      sessionStorage.setItem("overallGrade", this.overallGrade);

      resolve();
    });
  }

  public async rescan(): Promise<void> {
    // reset scores and rescan the site
    this.securityAnalyzing = true;
    this.manifestAnalyzing = true;
    this.swAnalyzing = true;

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

main {
  background-image: url("~/assets/images/homepage-background.svg");
  background-position: top;
  background-repeat: no-repeat;
  background-size: cover;
}

p {
  margin: 0;
  padding: 0;
}

.fa-check {
  color: #41807D;
}

.fa-times {
  color: red;
}

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

  header {
    position: absolute;
    top: 30px;
    left: 68px;

    img {
      height: 48px;
    }
  }

  section {
    flex: 1;
  }

  #headerSection {
    padding-top: 124px;

    #urlTested {
      font-weight: bold;
      margin-top: 0;
      margin-bottom: 0.2em;

      p {
        width: 376px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
    }

    div.mast {
      padding-left: 8em;
    }

    /*button#rescanButton {
      margin-top: 0;
      font-size: 12px;
      padding-top: 3px;
      padding-bottom: 4px;
      width: 70px;
    }*/

    #reportActionsBlock {
      display: flex;
      padding-left: 0;
    }

    #reportCardHeader {
      font-weight: bold;
      font-size: 36px;
      width: 376px;
    }

    #reportCardInfo {
      width: 376px;
      line-height: 28px;
      margin-top: 20px;
    }

    #rescanButton {
      background: #45ada8;
      height: 44px;
      margin-top: 40px;
      margin-right: 8px;
      border: none;
      border-radius: 22px;
      color: white;
      font-size: 18px;
      font-weight: bold;
      width: 130px;
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
      background: $color-button-primary-purple-variant;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  #scoreSection {
    background-color: $color-button-primary-purple-variant;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100%;
    margin-top: 60px;

    img {
      position: absolute;
      top: -25em;
      right: -2.2em;
      bottom: 0;
      z-index: -2;
      bottom: 0;
    }

    #scoreDiv {
      width: 221px;
      height: 221px;
      border-radius: 35px;
      background: white;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 92px;
      font-weight: bold;
      margin-bottom: 1.2em;
      flex-direction: column;

      span {
        font-size: 18px;
        position: relative;
        bottom: 8px;
        color: #8a8a8a;
        margin-top: 10px;
        font-weight: bold;
      }

      section {
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}

#catsContainer {
  padding-left: 6.4em;
  padding-right: 8em;
  position: relative;
  bottom: 1em;
}

#cats {
  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: auto auto;

  .catSection {
    border: solid 1px grey;
    padding: 30px;
    margin: 30px;
    // background: rgba(255, 255, 255, 0.5);
    background: white;
    display: flex;
    flex-direction: column;

    .catHeader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1em;
    }

    /*@media (max-width: 1300px) {
      .catHeader {
        width: 29em;
      }
    }*/

    ul {
      flex-grow: 2;
      list-style: none;
      padding: 0;
      margin: 0;
      margin-bottom: 42px;

      li {
        font-size: 18px;
        padding: 0.5em;
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        span {
          margin-left: 1em;
        }
      }
    }

    h2 {
      font-size: 24px;
      font-weight: bold;
      width: 420px;
    }

    .editDiv {
      display: flex;
    }

    .editButton {
      border-radius: 22px;
      border: none;
      height: 44px;
      background: grey;
      font-weight: bold;
      font-size: 18px;
      padding-top: 9px;
      padding-bottom: 11px;
      padding-left: 20px;
      padding-right: 20px;
      display: flex;
      justify-content: center;
      color: white;
      background: $color-button-primary-purple-variant;
    }

    .score {
      font-size: 36px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      color: black;

      .scoreSubText {
        color: #8A8A8A;
        font-size: 12px;
        width: 32px;
        text-align: center;
      }
    }
  }
}

.l-generator-field {
  width: 376px;
}


@media (max-width: 1300px) {
  #cats {
    grid-template-columns: none;
  }
}

#extrasP {
  flex-grow: 2;
}

#noSWP {
  flex-grow: 2;
}
</style>

