
<template>
  <main id="sideBySide">
    <section id="leftSide">
      <header>
        <img id="logo" src="~/assets/images/new-logo.svg" alt="App Logo">
      </header>

      <div id="introContainer">
        <h2>{{ $t('home.mast_title') }}</h2>

        <p>{{ $t('home.mast_tag') }}</p>

        <div id="formContainer">
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
    </section>

    <section id="rightSide"></section>
  </main>
</template>



<script lang='ts'>
import Vue from "vue";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

import GeneratorMenu from "~/components/GeneratorMenu.vue";
import GoodPWA from "~/components/GoodPWA.vue";
import Loading from "~/components/Loading.vue";
import * as generator from "~/store/modules/generator";

const GeneratorState = namespace(generator.name, State);
const GeneratorAction = namespace(generator.name, Action);

@Component({
  components: {
    GeneratorMenu,
    Loading,
    GoodPWA
  }
})
export default class extends Vue {
  public url$: string | null = null;
  public generatorReady = true;
  public error: string | null = null;

  @GeneratorState url: string;
  @GeneratorAction updateLink;
  @GeneratorAction getManifestInformation;

  public created(): void {
    this.url$ = this.url;
  }

  public get inProgress(): boolean {
    return !this.generatorReady && !this.error;
  }

  public skipCheckUrl(): void {
    this.$router.push({
      name: "features"
    });
  }

  public async checkUrlAndGenerate(): Promise<void> {
    this.generatorReady = false;
    this.error = null;

    if (!this.url$) {
      this.error = "You must enter a URL to get started";
      return;
    }

    try {
      await this.updateLink(this.url$);

      this.updateLink(this.url$);

      this.url$ = this.url;

      this.$router.push({
        name: "reportCard"
      });
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
}

declare var awa: any;

Vue.prototype.$awa = function(config) {
  awa.ct.capturePageView(config);

  return;
};
</script>

<style lang="scss" scoped>
@import "~assets/scss/base/variables";
/* stylelint-disable */

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

#sideBySide {
  display: flex;
  justify-content: space-around;
  height: 100vh;
  background-image: url("~/assets/images/homepage-background.svg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  #leftSide {
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 1em;
    justify-content: center;

    footer {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    footer p {
      text-align: center;
      width: 320px;
      font-size: 12px;
      color: #3c3c3c;
      line-height: 18px;
      margin-right: 2em;
    }

    header {
      display: flex;
      align-items: center;
      padding-left: 68px;
      margin-top: 30px;

      #headerText {
        font-size: 28px;
        font-weight: normal;
      }

      #logo {
        margin-right: 12px;
        width: 10em;
      }
    }
  }

  #rightSide {
    height: 100%;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  #introContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 2;
    justify-content: center;

    h2 {
      font-size: 36px;
      font-weight: bold;
      width: 386px;
    }

    p {
      margin-top: 30px;
      font-size: 18px;
      margin-bottom: 20px;
      width: 386px;
      text-align: left;
    }

    #moreInfoButton {
      width: 184px;
      border-radius: 20px;
      border: none;
      font-weight: bold;
      padding-top: 13px;
      padding-bottom: 12px;
      margin-top: 40px;
    }
  }

  #formContainer {
    width: 386px;

    #expertModeBlock {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      margin-top: 144px;
      margin-right: 72px;

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
      border-bottom: solid 1px rgba(60, 60, 60, 0.3);
      margin-right: 0.3em;
      margin-top: 20px;
      outline: none;
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
}

footer a {
  box-shadow: none;
}

#urlErr {
  color: red;
  margin-top: 1em;
  margin-left: 1em;
}

@media (max-width: 1282px) {
  #sideBySide #introContainer {
    padding-top: 3em;
    padding-left: 8em;
    padding-right: 13em;
  }
}

@media (max-height: 715px) {
  #introContainer {
    padding-top: 3em;
  }

  #expertModeBlock {
    margin-top: 31px !important;
  }
}

@media (min-width: 1280px) {
  #sideBySide #leftSide footer p {
    margin-right: 5em;
  }
}

@media (min-width: 1290px) {
  #sideBySide #introContainer {
    padding-right: 6em;
  }

  #sideBySide #leftSide header {
    padding-left: 111px;
  }

  #sideBySide #leftSide footer {
    width: 31em;
  }
}
</style>

