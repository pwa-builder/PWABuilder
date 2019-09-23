<template>
  <main id="publishMain">
    <HubHeader></HubHeader>

    <div
      v-if="openAndroid || openWindows || showBackground"
      class="has-acrylic-40 is-dark"
      id="modalBackground"
    ></div>

    <!-- appx modal -->
    <Modal
      id="appxModal"
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
        />

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
        />

        <div class="form-item">
          <label>{{ $t('publish.label_package') }}</label>
        </div>
        <input
          class="l-generator-input l-generator-input--largest"
          :placeholder="$t('publish.placeholder_package')"
          type="text"
          v-model="appxForm.package"
          requied
        />

        <div class="form-item">
          <label>{{ $t('publish.label_version') }}</label>
        </div>
        <input
          class="l-generator-input l-generator-input--largest"
          :placeholder="$t('publish.placeholder_version')"
          type="text"
          v-model="appxForm.version"
          requied
        />

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

          <a
            href="https://developers.google.com/web/updates/2019/02/using-twa#establish_an_association_from_the_website_to_the_app"
            id="androidModalSubText"
          >
            Note: For Trusted Web Activities you will need Android Studio to associate your PWA with your TWA
            <i
              class="fas fa-external-link-alt"
            ></i>
          </a>
        </div>

        <div id="androidModalButtonSection">
          <Download
            :showMessage="true"
            id="androidDownloadButton"
            platform="androidTWA"
            message="Download TWA"
          />
          <Download
            :showMessage="true"
            id="androidDownloadButton"
            class="webviewButton"
            platform="android"
            message="Download WebView"
          />
        </div>
      </section>
    </div>

    <div v-if="openWindows" ref="windowsModal" id="androidPlatModal">
      <button @click="closeAndroidModal()" id="closeAndroidPlatButton">
        <i class="fas fa-times"></i>
      </button>

      <section id="androidModalBody">
        <div>
          <p id="androidModalP">
            You'll get a side-loadable version of your PWA (requires Win10 in dev mode) to test your PWA right away.
            The Generate Appx button can be used to generate a PWA package to submit to the Microsoft Store.
          </p>
        </div>

        <div id="androidModalButtonSection">
          <Download
            id="androidDownloadButton"
            platform="windows10"
            :message="$t('publish.download')"
            :showMessage="true"
          />
          <button
            id="androidDownloadButton"
            @click="openAppXModal();  $awa( { 'referrerUri': 'https://www.pwabuilder.com/publish/windows10-appx' })"
          >Generate</button>
        </div>
      </section>
    </div>

    <section id="publishSideBySide">
      <section id="publishLeftSide">
        <div id="introContainer">
          <h2>Everything you need to make your PWA</h2>

          <p>
            If you haven’t already, download the content below and publish it to your website.
            Making these changes to your website is all you need to become a PWA.
            You may also want to publish your PWAs to the different app markets,
            you will find the packages for each of these on the right.
          </p>

          <!--<div id="publishActionsContainer">
          <!--<button id="downloadAllButton">Download your PWA files</button>-->
          <!--<Download id="downloadAllButton" platform="web" message="Download your PWA files"/>
          </div>-->
        </div>
      </section>

      <section id="publishRightSide">
        <div id="platformsListContainer">
          <ul>
            <div id="pwaMainCard" class="pwaCard">
              <div class="pwaCardHeaderBlock">
                <div class="pwaCardIconBlock">
                  <img id="pwaIcon" src="~/assets/images/pwaLogo.svg" />
                  <h2>Progressive Web App</h2>
                </div>

                <Download
                  class="platformDownloadButton"
                  platform="web"
                  message="Download your PWA files"
                />
              </div>

              <p>
                If you haven’t already, download these files and publish it to your website.
                Making these changes to your website is all you need to become a PWA.
              </p>
            </div>

            <div id="pwaAndroidCard" class="pwaCard">
              <div class="pwaCardHeaderBlock">
                <div class="pwaCardIconBlock">
                  <i id="platformIcon" class="fab fa-android"></i>
                  <h2>Android</h2>
                </div>

                <button class="platformDownloadButton" @click="openAndroidModal()">
                  <i class="fas fa-long-arrow-alt-down"></i>
                </button>
              </div>

              <p>PWAs are available through the browser on Android, however your PWA can also be submitted to the play store by submitting the package you get below.</p>
            </div>

            <div id="pwaWindowsCard" class="pwaCard">
              <div class="pwaCardHeaderBlock">
                <div class="pwaCardIconBlock">
                  <i id="platformIcon" class="fab fa-windows"></i>
                  <h2>Windows</h2>
                </div>

                <button class="platformDownloadButton" @click="openWindowsModal()">
                  <i class="fas fa-long-arrow-alt-down"></i>
                </button>
              </div>

              <p>You'll get a side-loadable version of your PWA (requires Win10 in dev mode) to test your PWA right away. To generate an AppX PWA package and submit to the Microsoft Store, click here</p>
            </div>

            <div id="pwaMacosCard" class="pwaCard">
              <div class="pwaCardHeaderBlock">
                <div class="pwaCardIconBlock">
                  <i id="platformIcon" class="fab fa-apple"></i>
                  <h2>MacOS</h2>
                </div>

                <Download class="platformDownloadButton" platform="macos" message="Download" />
              </div>

              <p>You can use Xcode to build this package to produce an app that runs on MacOS.</p>
            </div>

            <div id="pwaIosCard" class="pwaCard">
              <div class="pwaCardHeaderBlock">
                <div class="pwaCardIconBlock">
                  <i id="platformIcon" class="fab fa-apple"></i>
                  <h2>iOS</h2>
                </div>

                <Download class="platformDownloadButton" platform="ios" message="Download" />
              </div>

              <p>PWAs are available through the browser. You can submit this app package to the iOS App Store</p>
            </div>
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

    <footer>
      <p>
        PWA Builder was founded by Microsoft as a community guided, open source project to help move PWA adoption forward.
        <a
          href="https://privacy.microsoft.com/en-us/privacystatement"
        >Our Privacy Statement</a>
      </p>
    </footer>
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
  public openWindows: boolean = false;
  public showBackground: boolean = false;

  public created(): void {
    this.updateStatus();
  }

  public goToHome(): void {
    this.$router.push({
      path: this.$i18n.path("")
    });
  }

  public openAppXModal(): void {
    this.openWindows = false;
    (this.$refs.appxModal as Modal).show();
  }

  public openAndroidModal(): void {
    this.openAndroid = true;
  }

  public closeAndroidModal(): void {
    this.openAndroid = false;
    this.openWindows = false;
  }

  public openWindowsModal(): void {
    this.openWindows = true;
  }

  public closeWindowsModal(): void {
    this.openWindows = false;
  }

  public async onSubmitAppxModal(): Promise<void> {
    console.log("here");
    const $appxModal = this.$refs.appxModal as Modal;
    $appxModal.showLoading();

    try {
      await this.buildAppx(this.appxForm);

      if (this.appXLink) {
        window.location.href = this.appXLink;

        $appxModal.hideLoading();

        (this.$refs.appxModal as Modal).hide();
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
    this.showBackground = true;
  }

  public modalClosed() {
    console.log("modal closed");

    this.modalStatus = false;
    this.showBackground = false;
  }
}
</script>

<style lang="scss">
/* stylelint-disable */

@import "~assets/scss/base/variables";

footer {
  display: flex;
  justify-content: center;
  padding-left: 16em;
  padding-right: 16em;
  font-size: 12px;
  color: rgba(60, 60, 60, 0.5);
  background: white;
}

footer p {
  text-align: center;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 18px;
  color: #707070;
}

footer a {
  color: #707070;
  text-decoration: underline;
}

#pwaIcon {
  height: 22px;
  margin-right: 10px;
}

@media (max-height: 700px) {
  #scorepublishSideBySide header {
    top: 51px;
  }
}

#publishMain {
  // @include backgroundRightPoint(80%, 25vh);
  height: 100vh;
}

#modalBackground {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 98999;
  will-change: opacity;
}

#appxModal .modal {
  top: 8em;
  right: 10em;
  bottom: 8em;
  left: 10em;
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

#publishSideBySide {
  display: flex;
  justify-content: space-around;
  height: 100vh;
  /*background-image: url("~/assets/images/bg_publish.svg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;*/

  background-image: url("~/assets/images/publish-bg.svg");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: -45px;
  background-color: white;

  #publishLeftSide {
    height: 100%;
    flex: 1;

    display: flex;
    justify-content: center;
    align-items: center;
    /*background-image: url("~/assets/images/publish-bg.svg");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: left;*/

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
      padding-right: 5em;
      padding-left: 159px;
      color: white;

      h2 {
        font-family: poppins;
        font-weight: 600;
        font-size: 24px;
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

  #publishRightSide {
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    background: white;
    align-items: center;
    justify-content: center;
    padding-bottom: 100px;

    #platformsListContainer {
      padding-top: 4em;
      padding-right: 159px;
      padding-left: 52px;
      color: white;

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        display: grid;
        grid-template-areas: "header header" "windows android" "macos ios";
        grid-gap: 10px;

        .pwaCard {
          background: #f0f0f0;
          border-radius: 4px;
          color: #3c3c3c;
          padding-left: 24px;
          padding-right: 24px;
          padding-top: 20px;
          padding-bottom: 20px;

          .pwaCardHeaderBlock {
            display: flex;
            justify-content: space-between;
          }

          .pwaCardHeaderBlock h2 {
            font-style: normal;
            font-weight: bold;
            font-size: 16px;
            line-height: 24px;
          }

          .pwaCardIconBlock {
            display: flex;
            align-items: center;
          }

          .platformDownloadButton {
            border-radius: 50%;
            width: 30px;
            height: 30px;
            border: none;
            background: rgba(60, 60, 60, 0.1);
          }

          #platformIcon {
            font-size: 32px;
            margin-right: 10px;
          }

          p {
            font-style: normal;
            font-weight: normal;
            font-size: 14px;
            line-height: 21px;
          }
        }

        #pwaMainCard {
          grid-area: header;
        }

        #pwaAndroidCard {
          grid-area: android;
        }

        #pwaMacosCard {
          grid-area: macos;
        }

        #pwaWindowsCard {
          grid-area: windows;
        }

        #pwaIosCard {
          grid-area: ios;
        }

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
  padding-left: 60px;
  padding-right: 60px;
}

#closeAndroidPlatButton {
  top: 10px;
  border: none;
  float: right;
  height: 32px;
  background: #3c3c3c;
  color: white;
  border-radius: 50%;
  width: 32px;
  margin-top: 10px;
  margin-right: 10px;
  right: 10px;
  position: absolute;
  font-size: 14px;
}

#androidModalP {
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: -0.02em;
  margin-top: 40px;
}

#androidModalP a {
  color: #9337d8;
}

#androidModalBody #androidModalSubText {
  color: #3c3c3c;
  display: block;
  margin-bottom: 2em;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 21px;
}

#androidModalButtonSection {
  display: flex;
  justify-content: space-around;
  width: 80%;
  margin-top: 1em;
}

#androidDownloadButton {
  background: #9337d8;
  color: white;
  padding: 10px;
  font-size: 14px;
  border-radius: 20px;
  width: 150px;
  height: 40px;
  padding-left: 20px;
  padding-right: 20px;
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
}

#androidDownloadButton.webviewButton {
  width: 183px;
  background: #3c3c3c;
}

#androidDownloadButton:hover {
  cursor: pointer;
}

#androidPlatModal {
  background: white;
  position: fixed;
  top: 15em;
  right: 18em;
  bottom: 15em;
  left: 24em;
  z-index: 99999;
  overflow-y: auto;
  animation-name: opened;
  animation-duration: 250ms;
  border-radius: 4px;

  width: 590px;
  height: 266px;

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
  #publishSideBySide #publishLeftSide #introContainer {
    padding-right: 9em;
    color: white;
    padding-left: 52px;
  }

  #publishSideBySide #publishRightSide #platformsListContainer {
    padding-right: 52px;
  }

  #androidPlatModal {
    top: 15em;
    right: 18em;
    bottom: 12em;
    left: 18em;
  }
}

@media (min-width: 1445px) {
  #androidPlatModal {
    left: 26em;
  }
}

@media (max-width: 1441px) {
  #publishSideBySide {
    background-position: -86px;
  }
}

@media (min-width: 1445px) {
  #androidPlatModal {
    left: 26em;
  }
}

@media (max-height: 840px) {
  #publishSideBySide #publishLeftSide #introContainer {
    padding-right: 6em;
  }
}

@media (max-height: 765px) {
  #publishSideBySide #publishLeftSide #introContainer {
    padding-right: 10em;
  }
}

@media (min-width: 1500px) {
  #publishSideBySide #publishLeftSide #introContainer {
    padding-right: 12em;
  }
}

@media (min-width: 1700px) {
  #publishSideBySide #publishLeftSide #introContainer {
    padding-right: 17em;
  }
}

@media (min-width: 1900px) {
  #publishSideBySide #publishLeftSide #introContainer {
    padding-right: 22em;
  }
}

@media (min-width: 2000px) {
  #publishSideBySide #publishLeftSide #introContainer {
    padding-right: 28em;
  }
}

@media (min-width: 2300px) {
  #publishSideBySide #publishLeftSide #introContainer {
    padding-right: 32em;
  }
}

@media (min-width: 2450px) {
  #publishSideBySide #publishLeftSide #introContainer {
    padding-right: 38em;
  }
}
</style>

