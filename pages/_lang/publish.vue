<template>
  <main>
    <HubHeader></HubHeader>

    <div v-if="openAndroid" id="modalBackground"></div>

    <!-- appx modal -->
    <Modal
      :title="$t('publish.generate_appx')"
      ref="appxModal"
      @modalSubmit="onSubmitAppxModal"
      @cancel="onCancelAppxModal"
      v-on:modalOpened="modalOpened()"
      v-on:modalClosed="modalClosed()"
      v-if="appxForm"
    >
      <div id="topLabelBox" slot="extraP">
        <label id="topLabel">
          {{ $t('publish.enter_your') }}
          <a
            href="https://developer.microsoft.com/en-us/windows"
            target="_blank"
          >{{ $t('publish.dev_center') }}</a>
          {{ $t('publish.publisher_details') }}
        </label>
      </div>

      <section id="appxModalBody">
        <div>
          <label>{{ $t('publish.label_publisher') }}</label>
        </div>

        <input
          class="l-generator-input l-generator-input--largest"
          :placeholder="$t('publish.placeholder_publisher')"
          type="text"
          v-model="appxForm.publisher"
          requied
        >

        <div class="form-item">
          <label>{{ $t('publish.label_identity') }}</label>
          <label>{{ $t('publish.label_publisher_id') }}</label>
        </div>

        <input
          class="l-generator-input l-generator-input--largest"
          :placeholder="$t('publish.placeholder_identity')"
          type="text"
          v-model="appxForm.publisher_id"
          requied
        >

        <div class="form-item">
          <label>{{ $t('publish.label_package') }}</label>
        </div>
        <input
          class="l-generator-input l-generator-input--largest"
          :placeholder="$t('publish.placeholder_package')"
          type="text"
          v-model="appxForm.package"
          requied
        >

        <div class="form-item">
          <label>{{ $t('publish.label_version') }}</label>
        </div>
        <input
          class="l-generator-input l-generator-input--largest"
          :placeholder="$t('publish.placeholder_version')"
          type="text"
          v-model="appxForm.version"
          requied
        >

        <p class="l-generator-error" v-if="appxError">
          <span class="icon-exclamation"></span>
          {{ $t(appxError) }}
        </p>
      </section>
    </Modal>

    <!-- android platform modal -->
    <!--<Modal
      title="Android Platform"
      ref="androidModal"
      class="androidModal"
      :showSubmitButton="false"
      :showTitleBox="false"
      v-on:modalOpened="modalOpened()"
      v-on:modalClosed="modalClosed()"
    >
      <div id="topLabelBox" slot="extraP"></div>

      <section id="androidModalBody">
        <div>
          <p id="androidModalP">
            You can choose to package your PWA as a
            <a
              href="https://developers.google.com/web/updates/2019/02/using-twa"
            >Trusted Web Activity</a>
            or in a
            <a
              href="https://developer.android.com/reference/android/webkit/WebView"
            >traditional Webview</a>.
          </p>
        </div>

        <div id="androidModalButtonSection">
          <Download id="androidDownloadButton" platform="androidTWA" message="Download TWA"/>
          <Download id="androidDownloadButton" platform="android" message="Download WebView"/>
        </div>
      </section>
    </Modal>-->

    <div v-if="openAndroid" ref="androidModal" id="androidPlatModal">
      <button @click="closeAndroidModal()" id="closeAndroidPlatButton">
        <i class="fas fa-times"></i>
      </button>

      <section id="androidModalBody">
        <div>
          <p id="androidModalP">
            You can choose to package your PWA as a
            <a
              href="https://developers.google.com/web/updates/2019/02/using-twa"
            >Trusted Web Activity</a>
            or in a
            <a
              href="https://developer.android.com/reference/android/webkit/WebView"
            >traditional Webview</a>.
          </p>
        </div>

        <div id="androidModalButtonSection">
          <Download id="androidDownloadButton" platform="androidTWA" message="Download TWA"/>
          <Download id="androidDownloadButton" platform="android" message="Download WebView"/>
        </div>
      </section>
    </div>

    <section id="sideBySide">
      <section id="leftSide">
        <div id="introContainer">
          <h2>Everything you need to make your PWA</h2>

          <p>
            If you haven’t already, download the content below and publish it to your website.
            Making these changes to your website is all you need to become a PWA.
            You may also want to publish your PWAs to the different app markets,
            you will find the packages for each of these on the right.
          </p>

          <div id="publishActionsContainer">
            <!--<button id="downloadAllButton">Download your PWA files</button>-->
            <Download id="downloadAllButton" platform="web" message="Download your PWA files"/>
          </div>
        </div>
      </section>

      <section id="rightSide">
        <div id="platformsListContainer">
          <ul>
            <li id="windowsListItem">
              <div id="platformButtonBlock" class="windowsActionsBlock">
                <i id="platformIcon" class="fab fa-windows"></i>
                <Download
                  id="platformDownloadButton"
                  platform="windows10"
                  :message="$t('publish.download')"
                />

                <button
                  id="platformDownloadButton"
                  @click="openAppXModal();  $awa( { 'referrerUri': 'https://www.pwabuilder.com/publish/windows10-appx' })"
                >Generate</button>
              </div>

              <span>
                You'll get a side-loadable version of your PWA (requires Win10 in dev mode) to test your PWA right away.
                The Generate Appx button can be used to generate a PWA package to submit to the Microsoft Store.
              </span>
            </li>

            <li>
              <div id="platformButtonBlock">
                <i id="platformIcon" class="fab fa-apple"></i>
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
                <!--<Download
                  id="platformDownloadButton"
                  platform="android"
                  :message="$t('publish.download')"
                />-->
                <button id="platformDownloadButton" @click="openAndroidModal()">Download</button>
              </div>

              <span>PWAs are available through the browser on Android, however your PWA can also be submitted to the play store by submitting the package you get below.</span>
            </li>

            <!--<li>
              <div id="platformButtonBlock">
                <i id="platformIcon" class="fab fa-android"></i>
                <Download
                  id="platformDownloadButton"
                  platform="androidTWA"
                  :message="$t('publish.download')"
                />
              </div>

              <span>PWAs are available through the browser on Android, however your PWA can also be submitted to the play store by submitting the package you get below.</span>
            </li>-->

            <li>
              <div id="platformButtonBlock">
                <i id="platformIcon" class="fab fa-apple"></i>
                <Download
                  id="platformDownloadButton"
                  platform="ios"
                  :message="$t('publish.download')"
                />
              </div>

              <span>PWAs are available through the browser on iOS, however your PWA can also be submitted to the app store by submitting the package you get below.</span>
            </li>

            <!--<li>
              <div id="platformButtonBlock">
                <i id="platformIcon" class="fab fa-edge"></i>
                <Download
                  id="platformDownloadButton"
                  platform="web"
                  :message="$t('publish.download')"
                />
              </div>

              <span>Download these files and add them to your website. Different browsers will detect your Progressive Web App in different ways, but the manifest and service workers are required for each of them.</span>
            </li>-->
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
import HubHeader from "~/components/HubHeader.vue";

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
    HubHeader
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
  public modalStatus = false;
  public openAndroid: boolean = false;

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

  public openAndroidModal(): void {
    this.openAndroid = true;
  }

  public closeAndroidModal(): void {
    this.openAndroid = false;
  }

  public async onSubmitAppxModal(): Promise<void> {
    console.log("here");
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

  public modalOpened() {
    console.log("modal opened");
    window.scrollTo(0, 0);
    this.modalStatus = true;
  }

  public modalClosed() {
    console.log("modal closed");
    this.modalStatus = false;
  }
}
</script>

<style lang="scss" scoped>
/* stylelint-disable */

@import "~assets/scss/base/variables";

@media (max-height: 700px) {
  #scoreSideBySide header {
    top: 51px;
  }
}

main {
  @include backgroundRightPoint(80%, 25vh);
  height: 100vh;
}

#modalBackground {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: grey;
  opacity: 0.7;
  z-index: 98999;
  will-change: opacity;
}

@keyframes opened {
  from {
    opacity: 0;
  }

  to {
    opacity: 0.7;
  }
}

#appxModalBody {
  height: 6em;
  padding-left: 2em;
  padding-right: 10em;

  input {
    padding: initial;
  }

  div {
    margin-top: 40px;

    #topLabel {
      font-weight: initial;
    }

    label {
      font-weight: bold;
      margin-bottom: 20px;
      display: block;
    }
  }
}

#sideBySide {
  display: flex;
  justify-content: space-around;
  height: 100vh;
  /*background-image: url("~/assets/images/bg_publish.svg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;*/

  #leftSide {
    height: 100%;
    flex: 1;

    header {
      display: flex;
      align-items: center;
      padding-left: 159px;
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
      padding-top: 4em;
      padding-right: 14em;
      padding-left: 159px;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: white;

      h2 {
        font-size: 36px;
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
          width: 264px;
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
          width: 264px;
          border-radius: 20px;
          font-size: 18px;
          padding-top: 9px;
          padding-bottom: 11px;
          font-weight: bold;
          display: flex;
          justify-content: center;
        }

        #downloadAllButton:hover {
          cursor: pointer;
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
      padding-top: 4em;
      padding-right: 159px;
      color: white;

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        #windowsListItem {
          height: 100px;
        }

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
              background: white;
              color: #9337d8;
              cursor: pointer;
              width: 7.7em;
              height: 4em;
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

#topLabelBox {
  margin-bottom: 1em;
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

#androidModalBody {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 112px;
  padding-right: 112px;
}

#closeAndroidPlatButton {
  background: none;
  border: none;
  font-size: 1.2em;
  padding: 1em;
}

#androidModalP {
  font-size: 1em;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2.4em;
}

#androidModalButtonSection {
  display: flex;
  justify-content: space-around;
  width: 80%;
}

#androidDownloadButton {
  background: #9337d8;
  color: white;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 20px;
  padding-left: 14px;
  padding-right: 14px;
}

#androidDownloadButton:hover {
  cursor: pointer;
}

#androidPlatModal {
  background: white;
  position: fixed;
  top: 15em;
  right: 20em;
  bottom: 15em;
  left: 20em;
  z-index: 99999;
  overflow-y: auto;
  animation-name: opened;
  animation-duration: 250ms;

  will-change: opacity transform;
}

@keyframes opened {
  from {
    transform: scale(0.4, 0.4);
    opacity: 0.4;
  }

  to {
    transform: scale(1, 1);
    opacity: 1;
  }
}

.modalBackground {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: grey;
  opacity: 0.8;
  z-index: 98999;
}

@media (max-width: 1280px) {
  #sideBySide #leftSide #introContainer {
    padding-right: 9em;
    color: white;
    padding-left: 52px;
  }

  #sideBySide #rightSide #platformsListContainer {
    padding-right: 52px;
  }
}
</style>

