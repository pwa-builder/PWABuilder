
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

          <p id="reportCardInfo">
            Lorem ipsum dolor amet twee stumptown fashion axe bicycle rights.
            Ennui locavore shaman paleo art party schlitz succulents banh mi mixtape.
            Selvage 3 wolf moon stumptown art party edison bulb shaman.
          </p>

          <button @click="rescan()" id="rescanButton">Rescan</button>
        </div>
      </section>

      <section id="scoreSection">
        <div id="scoreDiv" v-if="!analyzing">{{overallGrade}}</div>
        <div id="scoreDiv" v-if="analyzing">
          <Loading id="gradeLoading" active class="u-display-inline_block u-margin-left-sm"/>
        </div>
      </section>
    </div>

    <section id="cats">
      <div id="manifest">
        <h2>Manifest</h2>

        <span v-if="!analyzing" class="score">{{manifestScore}}</span>
        <span v-if="analyzing" class="score">
          <Loading active class="u-display-inline_block u-margin-left-sm"/>
        </span>

        <ul>
          <li>Something</li>
          <li>Something</li>
          <li>Something</li>
          <li>Something</li>
        </ul>

        <button>Edit</button>
      </div>

      <div id="serviceWorker">
        <h2>Service Worker</h2>

        <span v-if="!analyzing" class="score">{{swScore}}</span>
        <span v-if="analyzing" class="score">
          <Loading active class="u-display-inline_block u-margin-left-sm"/>
        </span>

        <ul>
          <li>Something</li>
          <li>Something</li>
          <li>Something</li>
          <li>Something</li>
        </ul>

        <button>Edit</button>
      </div>

      <div>
        <h2>Security</h2>

        <span v-if="!analyzing" class="score">{{securityScore}}</span>
        <span v-if="analyzing" class="score">
          <Loading active class="u-display-inline_block u-margin-left-sm"/>
        </span>

        <ul>
          <li>Something</li>
          <li>Something</li>
          <li>Something</li>
          <li>Something</li>
        </ul>

        <button>Add More</button>
      </div>

      <div>
        <h2>Extras</h2>

        <span class="score">50</span>

        <ul>
          <li>Something</li>
          <li>Something</li>
          <li>Something</li>
          <li>Something</li>
        </ul>

        <button>Add More</button>
      </div>
    </section>
  </main>
</template>



<script lang='ts'>
import Vue from "vue";
import axios from "axios";
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

  swScore: number = 0;
  manifestScore: number = 0;
  securityScore: number = 0;
  overallGrade: string = "A";

  analyzing: boolean = false;

  public async created(): Promise<void> {
    await this.start();
  }

  private async start() {
    if (this.url) {
      this.analyzing = true;

      this.lookAtSecurity();
      this.lookAtManifest();
      await this.lookAtSW();
      this.calcGrade();

      console.log(this.overallGrade);

      this.analyzing = false;
    }
  }

  private lookAtSecurity() {
    if (this.url.includes("https")) {
      this.securityScore = this.securityScore + 100;
    }
  }

  private lookAtManifest() {
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
  }

  private async lookAtSW(): Promise<void> {
    if (this.url) {
      const data = await axios.get(`${apiUrl}=${this.url}`);
      console.log(data.data);

      /*
        Has service worker
        +50 points to user
      */
      if (data.data.hasSW !== null) {
        this.swScore = this.swScore + 50;
      }

      /*
        Caches stuff
        +30 points to user
      */
      const hasCache = data.data.cache.some(entry => entry.fromSW === true);
      console.log(hasCache);

      if (hasCache === true) {
        this.swScore = this.swScore + 30;
      }

      /*
        Has push reg
        +10 points to user
      */
      if (data.data.pushReg !== null) {
        this.swScore = this.swScore + 10;
      }

      /*
        Has scope that points to root
        +10 points to user
      */
      if (data.data.scope.slice(0, -1) === new URL(data.data.scope).origin) {
        console.log("has scope");
        this.swScore = this.swScore + 10;
      }
    }
  }

  private calcGrade() {
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
      this.overallGrade = "F";
    }
  }

  public async rescan(): Promise<void> {
    // reset scores and rescan the site
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

#scoreSideBySide {
  display: flex;
  height: 34em;

  section {
    flex: 1;
  }

  #headerSection {
    padding-top: 4em;

    div {
      padding-left: 8em;
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
    }
  }

  #scoreSection {
    background: $color-brand-tertiary;
    display: flex;
    justify-content: center;
    align-items: center;

    #scoreDiv {
      height: 260px;
      width: 280px;
      background: white;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 92px;
      font-weight: bold;
      border-radius: 32px;
    }
  }
}

#cats {
  margin-left: 164px;
  margin-right: 164px;
  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: auto auto;
  position: relative;
  bottom: 4.6em;

  div {
    border: solid 1px grey;
    padding: 40px;
    background: white;

    h2 {
      font-size: 36px;
      font-weight: bold;
      width: 420px;
    }

    button {
      width: 184px;
      border-radius: 22px;
      border: none;
      background: grey;
      font-weight: bold;
      font-size: 18px;
      padding-top: 9px;
      padding-bottom: 11px;
    }

    .score {
      position: relative;
      left: 12em;
      bottom: 1.2em;
      font-size: 36px;
      font-weight: bold;
    }
  }
}
</style>

