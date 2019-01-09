
<template>
  <main id="sideBySide">
    <section id="leftSide">
      <header>
        <img id="logo">
        <h1 id="headerText">PWABuilder</h1>
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
              @click=" $awa( { 'referrerUri': 'https://preview.pwabuilder.com/build/manifest-scan' })"
              id="getStartedButton"
            >
              <div>{{ $t('generator.start') }}</div>
              <div v-if="inProgress" id="loadingDiv">
                <Loading :active="inProgress" class="u-display-inline_block u-margin-left-sm"/>
              </div>
            </button>

            <div v-if="error" id="errorBox">{{error}}</div>
          </form>
        </div>
      </div>

      <button @click="skipCheckUrl()" id="expertModeButton">EXPERT MODE - Already have a manifest? Skip ahead!</button>
    </section>

    <section id="rightSide"></section>
    <!--<section id="getStartedBlock">
    <div class="mastHead">
      <h2>{{ $t('home.mast_title') }}</h2>

      <p>{{ $t('home.mast_tag') }}</p>
    </div>

    <div id="bottomBlock">
      <div id="leftBlock">
        <form @submit.prevent="checkUrlAndGenerate" @keydown.enter.prevent="checkUrlAndGenerate">
          <input id="getStartedInput" :aria-label="$t('generator.url')" :placeholder="$t('generator.placeholder_url')" name="siteUrl" type="text" ref="url"
            v-model="url$" autofocus />

          <button @click=" $awa( { 'referrerUri': 'https://preview.pwabuilder.com/build/manifest-scan' })" id="getStartedButton">
            {{ $t('generator.start') }}
            <Loading :active="inProgress" class="u-display-inline_block u-margin-left-sm"/>
          </button>

          <div v-if="error" id='errorBox'>
            {{error}}
          </div>
        </form>
      </div>
    </div>
  </section>
  <section class="pure-g proTag">
    <div id="alreadyPWA"> 
      <h3>Already have an awesome PWA?</h3>
      <nuxt-link to='windows'>
        Click here for a bunch of cool, free extras that you can add to your PWA to make it even better!
      </nuxt-link>
    </div>
  </section>
  <GeneratorMenu :first-link-path="true" />
  <div id="goodPWAHeaderBlock">
    <h2>  {{ $t('home.what_makes_title') }}</h2>
    <p>{{ $t('home.what_makes_body') }}</p>
  </div>
  <div class="homeGood">
    <GoodPWA :allGood="true"/>
  </div>
  <div id="otherTools">
    <div id="otherHeaderBlock">
      <h2>Other useful tools</h2>
    </div>-->
    <!--<div id="otherBar">
      <div id="otherTool">
        <img />
        <h4>Lorem ipsum so dolor</h4>
        <p>Lorem ipsum so dolor sit amet etc and a quick summary about what a PWA is. Also a link to more information</p>
      </div>

      <div id="otherTool">
        <img />
        <h4>Lorem ipsum so dolor</h4>
        <p>Lorem ipsum so dolor sit amet etc and a quick summary about what a PWA is. Also a link to more information</p>
      </div>

      <div id="otherTool">
        <img />
        <h4>Lorem ipsum so dolor</h4>
        <p>Lorem ipsum so dolor sit amet etc and a quick summary about what a PWA is. Also a link to more information</p>
      </div>

      <div id="otherTool">
        <img />
        <h4>Lorem ipsum so dolor</h4>
        <p>Lorem ipsum so dolor sit amet etc and a quick summary about what a PWA is. Also a link to more information</p>
      </div>
    </div>
    </div>-->
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
      name: "serviceworker"
    });
  }

  public async checkUrlAndGenerate(): Promise<void> {
    this.generatorReady = false;
    this.error = null;

    try {
      this.updateLink(this.url$);

      if (!this.url$) {
        return;
      }

      this.url$ = this.url;

      await this.getManifestInformation();

      this.$router.push({
        // name: 'generate'
        name: "reportCard"
      });
    } catch (e) {
      if (e.message) {
        this.error = e.message;
      } else {
        // No error message
        // so just show error directly
        this.error = e;
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

#sideBySide {
  display: flex;
  justify-content: space-around;
  height: 100vh;

  #leftSide {
    background: white;
    height: 100%;
    flex: 1;

    header {
      display: flex;
      align-items: center;
      padding-left: 68px;
      margin-top: 32px;

      #headerText {
        font-size: 28px;
        font-weight: normal;
      }

      #logo {
        background: lightgrey;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        margin-right: 12px;
      }
    }

    footer {
      position: fixed;
      bottom: 0px;
      padding-bottom: 20px;
      width: 45em;
      display: flex;
      justify-content: center;

      h3 {
        font-size: 14px;
        width: 376px;
      }
    }
  }

  #rightSide {
    background: $color-brand-tertiary;
    height: 100%;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  #introContainer {
    padding-top: 9em;
    padding-right: 100px;
    padding-left: 8em;
    display: flex;
    flex-direction: column;
    align-items: center;

    h2 {
      font-size: 48px;
      color: black;
      font-weight: bold;
    }

    p {
      margin-top: 40px;
      font-size: 18px;
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
    width: 100%;

    #loadingDiv {
      margin-left: 10px;
    }

    form {
      display: flex;
    }

    input {
      padding-top: 13px;
      padding-bottom: 12px;
      padding-left: 20px;
      font-weight: bold;
      font-size: 14px;
      border: none;
      width: 24em;
      border-bottom: solid 1px lightgrey;
      margin-right: 2em;
      margin-top: 40px;
    }

    #getStartedButton {
      border: none;
      font-weight: bold;
      font-size: 18px;
      border-radius: 20px;
      padding-top: 9px;
      padding-bottom: 11px;
      padding-left: 23px;
      padding-right: 23px;
      background: grey;
      height: 44px;
      align-self: flex-end;
      display: flex;
      flex-direction: row;
      align-items: baseline;
    }
  }

  #expertModeButton {
    width: 42.4em;
    background: grey;
    border: none;
    height: 80px;
    opacity: 0.6;
    position:absolute;
    bottom: 0;
  }
}

/*#otherTools {
    display: none;
  }

.mastHead {
  margin-top: 3em;
  margin-bottom: 9.2em;
}

#errorBox {
  color: $color-brand-secondary;
  position: absolute;
  margin-top: 5px;
}

.proTag {
  font-size: 22px;
  margin: 100px 138px 0 138px;
}

.proTag a,
.proTag a:visited {
  color: $color-brand-quintary;
  font-size: 16px;
}

.proTag h3 {
  color: $color-brand-primary;
  font-size: 24px;
}

#whatMakesBlock,
#otherTools {
  padding-bottom: 48px;
  padding-left: 68px;
  padding-right: 68px;
  padding-top: 65px;
}

#quickBlockText {
  color: $color-brand-quintary;
  font-size: 36px;
  margin: 0;
}

#quickBlockPlaceholder {
  color: $color-brand-quintary;
  font-size: 24px;
}

.l-generator-step {
  padding: 0;
}

#bottomBlock {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-left: 68px;
  margin-bottom: 3em;
}

#getStartedBlock {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
}

p {
  font-size: 16px;
}

#quickTextBlock {
  margin-bottom: 27px;
  margin-top: 22px;
}

#getStartedInput {
  border: solid 1px $color-brand-tertiary;
  border-radius: 1px;
  font-size: 14px;
  padding: 10px;
}

#goodPWAHeaderBlock {
  color: $color-brand-primary;
  font-size: 16px;
  line-height: 24px;
  margin-left: 138px;
  margin-top: 100px;

  h2 {
    color: $color-brand-primary;
    font-size: 24px;
  }
}

#getStartedButton {
  background-color: $color-brand-quintary;
  border: none;
  border-radius: 1px;
  color: $color-brand-primary;
  font-size: 14px;
  margin-left: 8px;
  padding: 10px;
  text-align: center;
}

#otherTool {
  margin-top: 41px;
}

#otherTool p {
}

#otherTool img {
  height: 184px;
}*/
</style>

