
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
            We've had a look over your site and it's looking good.
            You've already got a manifest, which forms the base of a PWA,
            but we highly recommend you add some features like
            Service Workers to make the experience even better for your users.
          </p>

          <button id="rescanButton">Rescan</button>
        </div>
      </section>

      <section id="scoreSection">
        <div id="scoreDiv">B+</div>
      </section>
    </div>

    <section id="cats">
      <div id="manifest">
        <h2>Manifest</h2>

        <span class="score">50</span>

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

        <span class="score">50</span>

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

        <span class="score">50</span>

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

import * as generator from "~/store/modules/generator";

const GeneratorState = namespace(generator.name, State);
const GeneratorAction = namespace(generator.name, Action);

const apiUrl = `${
  process.env.apiUrl
}/serviceworkers/getServiceWorkerFromUrl?siteUrl`;

@Component({
  components: {
    GoodPWA
  }
})
export default class extends Vue {
  @GeneratorState url: string;
  @GeneratorAction getManifestInformation;

  public async created(): Promise<void> {
    console.log("hello world", this.url);
    if (this.url) {
      const data = await axios.get(`${apiUrl}=${this.url}`);
      console.log(data.data);

      const manifestInfo = await this.getManifestInformation();
      console.log(manifestInfo);
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

