<template>
  <!--<section>
    <section id="getStartedBlock">
      <div class="mastHead">
        <h2>Download and publish your shiny new app</h2>

        <p>
          You have a few different options to publish your app. You can download the
          files and deploy them to your site, or you can download pre-populated app projects for the major app
          platforms from the links below.
        </p>
      </div>
    </section>

    <div class>
      <div class="downloadSection">
        <section id="downloadForSite">
          <h2>Download these files to add to your site</h2>
          <a href="https://www.microsoft.com">What do I do with these files?</a>

          <div id="lists">
            <h3 id="justTheseText">Download files for Web:</h3>
            <ul id="downloadList">
              <li>
                <input id="manifest" v-model="files" value="manifest" type="checkbox">
                <label for="manifest">App Manifest</label>
              </li>

              <li>
                <input id="serviceWorkers" v-model="files" value="serviceWorkers" type="checkbox">
                <label for="serviceWorkers">Service Workers</label>
              </li>

              <li>
                <input id="apiSamples" v-model="files" value="apiSamples" type="checkbox">
                <label for="apiSamples">API Samples</label>
              </li>

              <li>
                <input id="windows10" v-model="files" value="windows10Package" type="checkbox">
                <label for="windows10">Windows 10 sideloader</label>
              </li>
            </ul>

            <Download platform="web" :parameters="files" :message="$t('publish.download')"/>
          </div>
        </section>

        <section id="andOr">
          <h2>And / Or</h2>
        </section>

        <section id="generateProject">
          <h2>Or let us generate some app projects for you</h2>
          <a href="https://www.microsoft.com">What do I do with these files?</a>

          <div class="platformCard">
            <h3>Windows</h3>
            <p>
              Service Worker support requires RS4 or above. You'll get a copy of each PWAbuilder component as well as
              a side-loadable version of your PWA (requires Win10 in dev mode). The Generate Appx button can be used to
              generate a PWA package to submit to the Microsoft Store.
            </p>
            <Download platform="windows10" :message="$t('publish.download')"/>
          </div>

          <div class="platformCard">
            <h3>mac OS</h3>
            <p>You can use Xcode to build this package to produce an app that runs on MacOS.</p>
            <Download platform="MacOS" :message="$t('publish.download')"/>
          </div>

          <div class="platformCard">
            <h3>Android</h3>
            <p>
              PWAs are available through the browser on Android, however your PWA can also be submitted to the play
              store by submitting the package you get below.
            </p>
            <Download platform="android" :message="$t('publish.download')"/>
          </div>

          <div class="platformCard">
            <h3>iOS</h3>
            <p>
              PWAs are avaiable through the browser on iOS, however your PWA can also be submitted to the app
              store by building the package you get below in Xcode.
            </p>
            <Download platform="ios" :message="$t('publish.download')"/>
          </div>
        </section>
      </div>
    </div>
  </section>-->
  <main>
    <ScoreHeader></ScoreHeader>

    <section id="sideBySide">
      <section id="leftSide">
        <!--<header>
          <img id="logo">
          <h1 id="headerText">PWABuilder</h1>
        </header>-->
        <div id="introContainer">
          <h2>Download and publish your shiny new app</h2>

          <p>
            You have a few different options to publish your app. You can download the
            files and deploy them to your site, or you can download pre-populated app projects for the major app
            platforms from the links below.
          </p>

          <div id="publishActionsContainer">
            <button id="downloadAllButton">Download All</button>
            <!--<button id="showcaseButton">See Showcase</button>-->
          </div>
        </div>
      </section>

      <section id="rightSide">
        <div id="platformsListContainer">
          <ul>
            <li>
              <div id="platformButtonBlock">
                <i id="platformIcon" class="fab fa-windows"></i>
                <Download
                  id="platformDownloadButton"
                  platform="windows10"
                  :message="$t('publish.download')"
                />
              </div>

              <span>
                Service Worker support requires RS4 or above. You'll get a copy of each PWAbuilder component as well as
                a side-loadable version of your PWA (requires Win10 in dev mode). The Generate Appx button can be used to
                generate a PWA package to submit to the Microsoft Store.
              </span>
            </li>

            <li>
              <div id="platformButtonBlock">
                <i id="platformIcon" class="fab fa-apple"></i>
                <!--<Download platform="windows10" :message="$t('publish.download')"/>-->
                <Download
                  id="platformDownloadButton"
                  platform="MacOS"
                  :message="$t('publish.download')"
                />
              </div>

              <span>You can use Xcode to build this package to produce an app that runs on MacOS.</span>
            </li>

            <li>
              <div id="platformButtonBlock">
                <i id="platformIcon" class="fab fa-android"></i>
                <!--<Download platform="windows10" :message="$t('publish.download')"/>-->
                <Download
                  id="platformDownloadButton"
                  platform="Android"
                  :message="$t('publish.download')"
                />
              </div>

              <span>PWAs are available through the browser on Android, however your PWA can also be submitted to the play store by submitting the package you get below.</span>
            </li>

            <li>
              <div id="platformButtonBlock">
                <i id="platformIcon" class="fab fa-apple"></i>
                <!--<Download platform="windows10" :message="$t('publish.download')"/>-->
                <Download
                  id="platformDownloadButton"
                  platform="ios"
                  :message="$t('publish.download')"
                />
              </div>

              <span>PWAs are available through the browser on iOS, however your PWA can also be submitted to the app store by submitting the package you get below.</span>
            </li>

            <li>
              <div id="platformButtonBlock">
                <i id="platformIcon" class="fab fa-edge"></i>
                <!--<Download platform="windows10" :message="$t('publish.download')"/>-->
                <Download
                  id="platformDownloadButton"
                  platform="web"
                  :message="$t('publish.download')"
                />
              </div>

              <span>Download these files and add them to your website. Different browsers will detect your Progressive Web App in different ways, but the manifest and service workers are required for each of them.</span>
            </li>
          </ul>
        </div>
      </section>
    </section>

    <section id="bottomSection">
      <div id="coolPWAs">
        <h2>Scope out rad PWAs</h2>

        <p>Pinterest, Spotify, and more built some PWAs and they are like whoa! Check them out by clicking on the image or logos. Love doing PWAs? Submit your own!</p>

        <div id="iconGrid">
          <div>
            <i id="platformIcon" class="fab fa-pinterest"></i>
          </div>
          <div>
            <i id="platformIcon" class="fab fa-spotify"></i>
          </div>
          <div>
            <i id="platformIcon" class="fab fa-microsoft"></i>
          </div>
        </div>
      </div>

      <div id="bottomImageSection">
        <span>I will hold things</span>
      </div>
    </section>
  </main>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

import GeneratorMenu from "~/components/GeneratorMenu.vue";
import StartOver from "~/components/StartOver.vue";
import Download from "~/components/Download.vue";
import Modal from "~/components/Modal.vue";
import PublishCard from "~/components/PublishCard.vue";
import Toolbar from "~/components/Toolbar.vue";
import ScoreHeader from "~/components/ScoreHeader.vue";

import * as publish from "~/store/modules/publish";

const PublishState = namespace(publish.name, State);
const PublishAction = namespace(publish.name, Action);

@Component({
  components: {
    GeneratorMenu,
    Download,
    StartOver,
    Modal,
    PublishCard,
    Toolbar,
    ScoreHeader
  }
})
export default class extends Vue {
  public appxForm: publish.AppxParams = {
    publisher: null,
    publisher_id: null,
    package: null,
    version: null
  };

  // Set default web checked items
  public files: any[] = [
    "manifest",
    "serviceWorkers",
    "apiSamples",
    "windows10Package"
  ];

  // @PublishState status: boolean;
  @PublishState status = true;
  @PublishState appXLink: string;

  @PublishAction updateStatus;
  @PublishAction buildAppx;

  public appxError: string | null = null;

  public created(): void {
    this.updateStatus();
  }

  public goToHome(): void {
    this.$router.push({
      path: this.$i18n.path("")
    });
  }

  public openAppXModal(): void {
    (this.$refs.appxModal as Modal).show();
  }

  public async onSubmitAppxModal(): Promise<void> {
    const $appxModal = this.$refs.appxModal as Modal;
    $appxModal.showLoading();

    try {
      await this.buildAppx(this.appxForm);

      if (this.appXLink) {
        window.location.href = this.appXLink;
      }
    } catch (e) {
      this.appxError = e;
      $appxModal.hideLoading();
    }
  }

  public onCancelAppxModal(): void {
    this.appxForm = {
      publisher: null,
      publisher_id: null,
      package: null,
      version: null
    };
  }
}
</script>

<style lang="scss" scoped>
/* stylelint-disable */

@import "~assets/scss/base/variables";

/*.mastHead {
  margin-bottom: 12em;
}

.l-generator-step {
  padding: 0;
}

#getStartedBlock {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
}

#goodPWAHeaderBlock {
  width: 760px;
}

#goodBetterBar,
#otherBar {
  display: flex;
  justify-content: space-between;
}

.platformCard {
  margin-bottom: 68px;
}

#whatMakesBlock,
#otherTools {
  padding-bottom: 48px;
  padding-left: 68px;
  padding-right: 68px;
  padding-top: 65px;
}

.light {
  background: white;
}

#quickBlockPlaceholder {
  width: 430px;
  color: $color-brand-tertiary;
  font-size: 22px;
  line-height: 32px;
}

#downloadAllButton {
  display: block;
  margin-bottom: 12px;
  margin-top: 44px;
}

.downloadSection {
  display: flex;
  flex-direction: row;
  margin: 0 68px;
  justify-content: space-between;

  h2 {
    font-size: 18px;
    line-height: 45px;
  }

  a,
  a:visited {
    display: block;
    margin: 18px 0 24px;
    color: $color-brand-secondary;
  }

  h3 {
    font-size: 16px;
    line-height: 26px;
  }
}

#andOr {
  flex-flow: nowrap;
  color: $color-brand-quartary;
  flex-basis: 8%;
}

#generateProject {
  width: 50%;
  display: flex;
  flex-direction: column;
}

#downloadForSite {
  width: 40%;
  display: flex;
  flex-direction: column;

  ul {
    margin-left: 0;
    padding-left: 0;
    list-style: none;
    margin-block-start: 0;
    margin-block-end: 0;
    padding-inline-start: 0;
    padding-bottom: 24px;
  }
}

label {
  margin-left: 15px;
}

.platformCard p {
  font-size: 16px;
  line-height: 24px;
  width: 472px;
}

[type="checkbox"]:checked,
[type="checkbox"]:not(:checked) {
  opacity: 0;
}
[type="checkbox"]:checked + label,
[type="checkbox"]:not(:checked) + label {
  position: relative;
  padding-left: 32px;
  cursor: pointer;
  line-height: 24px;
}
[type="checkbox"]:checked + label:before,
[type="checkbox"]:not(:checked) + label:before {
  content: "";
  position: absolute;
  left: 5px;
  top: 5px;
  width: 16px;
  height: 16px;
  background-image: url("~/assets/images/unChecked.png");
  background-repeat: no-repeat;
  background-size: 16px;
}
[type="checkbox"]:checked + label:after,
[type="checkbox"]:not(:checked) + label:after {
  content: "";
  width: 16px;
  height: 16px;
  background-image: url("~/assets/images/checked.png");
  background-repeat: no-repeat;
  background-size: 16px;
  position: absolute;
  left: 5px;
  top: 5px;
  transition: all 0.2s ease;
}
[type="checkbox"]:not(:checked) + label:after {
  opacity: 0;
  transform: scale(0);
}
[type="checkbox"]:checked + label:after {
  opacity: 1;
  transform: scale(1);
}*/

#sideBySide {
  display: flex;
  justify-content: space-around;
  height: 100vh;
  background-image: url("~/assets/images/bg_publish.svg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  #leftSide {
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

    #introContainer {
      padding-top: 6em;
      padding-right: 10em;
      padding-left: 10em;
      display: flex;
      flex-direction: column;
      align-items: center;

      h2 {
        font-size: 36px;
        color: black;
        font-weight: bold;
      }

      p {
        font-size: 18px;
      }

      #publishActionsContainer {
        display: flex;
        width: 100%;

        button {
          border: none;
          width: 184px;
          border-radius: 20px;
          font-size: 18px;
          font-weight: bold;
          padding-top: 9px;
          padding-bottom: 11px;
        }

        #downloadAllButton {
          margin-right: 11px;
          background: $color-button-primary-purple-variant;
          color: white;
        }
      }
    }
  }

  #rightSide {
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;

    #platformsListContainer {
      padding-top: 6.7em;
      padding-right: 8em;

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          display: flex;
          height: 84px;
          margin-bottom: 30px;

          span {
            margin-left: 19px;
            font-size: 14px;
            font-weight: normal;
            width: 476px;
          }

          #platformButtonBlock {
            display: flex;
            flex-direction: column;
            align-items: center;

            #platformIcon {
              font-size: 44px;
            }

            #platformDownloadButton {
              border: none;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              padding-bottom: 5px;
              padding-top: 3px;
              padding-left: 11px;
              padding-right: 11px;
              margin-top: 11px;
              background: grey;
              color: white;
              cursor: pointer;
              width: 6.7em;
              display: flex;
              justify-content: center;
              align-items: center;
            }
          }
        }
      }
    }
  }
}

#bottomSection {
  // display: flex;
  display: none;

  #coolPWAs {
    padding-left: 10em;
    flex: 1;

    h2 {
      font-size: 36px;
      font-weight: bold;
    }

    p {
      width: 392px;
      font-size: 18px;
    }

    #iconGrid {
      display: grid;
      grid-template-columns: auto auto auto;
      width: 392px;
      margin-top: 36px;

      svg {
        font-size: 64px;
      }
    }
  }

  #bottomImageSection {
    flex: 1;
  }
}
</style>

