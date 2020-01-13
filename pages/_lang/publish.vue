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
          {{ $t("publish.enter_your") }}
          <a
            href="https://developer.microsoft.com/en-us/windows"
            target="_blank"
            >{{ $t("publish.dev_center") }}</a
          >
          {{ $t("publish.publisher_details") }}
        </label>
      </div>

      <section id="appxModalBody">
        <div>
          <label>{{ $t("publish.label_publisher") }}</label>
        </div>

        <input
          class="l-generator-input l-generator-input--largest"
          :placeholder="$t('publish.placeholder_publisher')"
          type="text"
          v-model="appxForm.publisher"
          requied
        />

        <div class="form-item">
          <label>{{ $t("publish.label_identity") }}</label>
          <label>{{ $t("publish.label_publisher_id") }}</label>
        </div>

        <input
          class="l-generator-input l-generator-input--largest"
          :placeholder="$t('publish.placeholder_identity')"
          type="text"
          v-model="appxForm.publisher_id"
          requied
        />

        <div class="form-item">
          <label>{{ $t("publish.label_package") }}</label>
        </div>
        <input
          class="l-generator-input l-generator-input--largest"
          :placeholder="$t('publish.placeholder_package')"
          type="text"
          v-model="appxForm.package"
          requied
        />

        <div class="form-item">
          <label>{{ $t("publish.label_version") }}</label>
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
              >Trusted Web Activity</a
            >
            or in a
            <a
              href="https://developer.android.com/reference/android/webkit/WebView"
              >traditional Webview</a
            >.
          </p>

          <a
            href="https://developers.google.com/web/updates/2019/02/using-twa#establish_an_association_from_the_website_to_the_app"
            id="androidModalSubText"
          >
            Note: For Trusted Web Activities you will need Android Studio to
            associate your PWA with your TWA
            <i class="fas fa-external-link-alt"></i>
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
            You'll get a side-loadable version of your PWA (requires Win10 in
            dev mode) to test your PWA right away. The Generate Appx button can
            be used to generate a PWA package to submit to the Microsoft Store.
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
            @click="
              openAppXModal();
              $awa({
                referrerUri: 'https://www.pwabuilder.com/publish/windows10-appx'
              });
            "
          >
            Generate
          </button>
        </div>
      </section>
    </div>

    <section id="publishSideBySide">
      <section id="publishLeftSide">
        <div id="introContainer">
          <h2>Everything you need to make your PWA</h2>

          <p>
            If you haven’t already, download the content below and publish it to
            your website. Making these changes to your website is all you need
            to become a PWA. You may also want to publish your PWAs to the
            different app markets, you will find the packages for each of these
            on the right.
          </p>

          <!--<div id="publishActionsContainer">
          <!--<button id="downloadAllButton">Download your PWA files</button>-->
          <!--<Download id="downloadAllButton" platform="web" message="Download your PWA files"/>
          </div>-->

          <!--temp impl for demo-->
         
        </div>
      </section>

      <section id="publishRightSide">
        <div id="platformsListContainer">
          <ul>
            <div
              @mouseover="platCardHover($event)"
              @mouseleave="platCardUnHover($event)"
              id="pwaMainCard"
              class="pwaCard"
            >
              <div class="pwaCardHeaderBlock">
                <div class="pwaCardIconBlock">
                  <img id="pwaIcon" src="~/assets/images/pwaLogo.svg" />
                  <h2>Progressive Web App</h2>
                </div>
              </div>

              <p>
                If you haven’t already, download these files and publish it to
                your website. Making these changes to your website is all you
                need to become a PWA.
              </p>

              <section class="platformDownloadBar">
                <Download
                  class="platformDownloadButton"
                  platform="web"
                  message="Download your PWA files"
                />
              </section>
            </div>

            <div
              @mouseover="platCardHover($event)"
              @mouseleave="platCardUnHover($event)"
              id="pwaAndroidCard"
              class="pwaCard"
            >
              <div class="pwaCardHeaderBlock">
                <i id="platformIcon" class="fab fa-android"></i>
                <h2>Android</h2>
              </div>

              <p>
                PWAs are available through the browser on Android, however your
                PWA can also be submitted to the play store by submitting the
                package you get below.
              </p>

              <section class="platformDownloadBar">
                <button
                  class="platformDownloadButton"
                  @click="openAndroidModal()"
                >
                  <i class="fas fa-long-arrow-alt-down"></i>
                </button>
              </section>
            </div>

            <!--samsung platform-->
            <div
              @mouseover="platCardHover($event)"
              @mouseleave="platCardUnHover($event)"
              id="pwaSamsungCard"
              class="pwaCard"
            >
              <div class="pwaCardHeaderBlock">
                <svg
                  width="89"
                  height="30"
                  viewBox="0 0 89 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M88.5919 7.15122C87.3559 0.0897582 66.5652 -2.11414 42.1107 2.2037C31.8699 4.04778 22.6001 6.74643 15.3609 9.75992C16.4644 9.8049 17.3031 10.0298 17.7887 10.5695C18.186 10.9743 18.3625 11.514 18.3625 12.1887V12.9083H15.9789V12.2787C15.9789 11.7839 15.6699 11.4241 15.1402 11.4241C14.6988 11.4241 14.3898 11.649 14.3015 12.0538C14.2574 12.1887 14.2574 12.3686 14.3015 12.5485C14.5663 13.628 18.0977 14.2577 18.4949 16.2367C18.5391 16.5065 18.6274 17.0463 18.4949 17.8109C18.2742 19.3851 16.9058 20.0148 15.1402 20.0148C12.7124 20.0148 11.6971 18.8454 11.6971 17.2262V16.4616H14.2574V17.4061C14.2574 17.9458 14.6546 18.2607 15.1402 18.2607C15.6257 18.2607 15.9347 18.0358 16.023 17.631C16.0672 17.4511 16.1113 17.1812 16.023 16.9563C15.5375 15.7419 12.2268 15.1572 11.8296 13.2232C11.7413 12.7734 11.7413 12.4136 11.7854 11.9188C11.8296 11.649 11.9178 11.4241 12.0061 11.2442C4.10478 15.0223 -0.574232 19.2052 0.0437503 22.8484C1.27972 29.9098 22.0704 32.1137 46.4807 27.7509C57.2072 25.8619 66.8742 22.9833 74.2458 19.7899C74.1575 19.7899 74.0251 19.7899 73.9368 19.7899C72.2594 19.7899 70.7586 19.1602 70.6262 17.4061C70.5821 17.0912 70.5821 16.9563 70.5821 16.7764V12.7734C70.5821 12.5935 70.5821 12.2787 70.6262 12.1437C70.8028 10.4796 72.127 9.75992 73.9368 9.75992C75.3494 9.75992 77.0709 10.1647 77.2475 12.1437C77.2916 12.4136 77.2916 12.6385 77.2475 12.7284V13.0883H74.8197V12.5935C74.8197 12.5935 74.8197 12.3686 74.7755 12.2337C74.7314 12.0538 74.5548 11.559 73.8927 11.559C73.2306 11.559 73.054 12.0088 73.0098 12.2337C72.9657 12.3236 72.9657 12.5035 72.9657 12.6835V17.0463C72.9657 17.1812 72.9657 17.3161 72.9657 17.4061C72.9657 17.496 73.0981 18.0808 73.8927 18.0808C74.6872 18.0808 74.8197 17.496 74.8197 17.4061C74.8197 17.2712 74.8638 17.1362 74.8638 17.0463V15.6969H73.8927V14.2577H77.2475V16.8214C77.2475 17.0013 77.2475 17.1362 77.2033 17.4511C77.1592 17.9008 77.0267 18.3056 76.806 18.6205C84.6632 14.8424 89.1657 10.7044 88.5919 7.15122ZM25.2045 19.655L23.9685 11.1542H23.9244L22.6884 19.655H20.084L21.8056 10.0748H26.0432L27.7647 19.655H25.2045ZM37.6083 19.655L37.5641 11.3341H37.52L36.0192 19.655H33.5914L32.0906 11.3341H32.0464L32.0023 19.655H29.5745L29.7952 10.0748H33.6797L34.8274 17.1812H34.8715L36.0192 10.0748H39.9036L40.1243 19.655H37.6083ZM48.9527 17.7659C48.6878 19.61 46.9222 19.9248 45.642 19.9248C43.5674 19.9248 42.2431 19.0253 42.2431 17.1362V16.3716H44.8034V17.3161C44.8034 17.8109 45.1565 18.1257 45.6862 18.1257C46.1717 18.1257 46.4807 17.9458 46.569 17.496C46.6132 17.3161 46.6132 17.0463 46.569 16.8214C46.0835 15.607 42.817 15.0223 42.4197 13.0883C42.3314 12.6385 42.3314 12.2787 42.3756 11.8289C42.6404 10.0748 44.3178 9.71494 45.642 9.71494C46.8339 9.71494 47.7167 9.98481 48.2023 10.5245C48.5995 10.9293 48.7761 11.4691 48.7761 12.1437V12.8184H46.3925V12.1887C46.3925 11.649 46.0835 11.3791 45.5538 11.3791C45.1123 11.3791 44.8034 11.604 44.7151 12.0088C44.7151 12.0987 44.6709 12.2787 44.7151 12.5035C44.9799 13.583 48.5113 14.2127 48.8644 16.1917C48.9968 16.4616 49.041 17.0013 48.9527 17.7659ZM57.7369 16.9113C57.7369 17.0912 57.7369 17.4511 57.6927 17.541C57.5603 19.1152 56.4567 19.9248 54.4262 19.9248C52.3957 19.9248 51.2922 19.1152 51.1156 17.541C51.1156 17.4511 51.0715 17.0912 51.0715 16.9113V10.0298H53.4993V17.0912C53.4993 17.2712 53.4993 17.3611 53.4993 17.4511C53.5434 17.631 53.6758 18.1257 54.3821 18.1257C55.0442 18.1257 55.2208 17.631 55.2649 17.4511C55.2649 17.3611 55.2649 17.2262 55.2649 17.0912V10.0298H57.6927C57.7369 10.0298 57.7369 16.9113 57.7369 16.9113ZM68.1984 19.52H64.7995L62.5483 11.9188H62.5042L62.6366 19.52H60.2971V10.0298H63.8284L65.9472 17.3161H65.9913L65.8589 10.0298H68.2426V19.52H68.1984Z"
                    fill="#3C3C3C"
                  />
                </svg>

                <h2>Samsung</h2>
              </div>

              <p>
                PWAs are available through the browser on Samsung devices,
                however your PWA can also be submitted to the Galaxy store by
                submitting the package you get below.
              </p>

              <section class="platformDownloadBar">
                <Download
                  class="platformDownloadButton"
                  platform="samsung"
                  message="Download"
                />
              </section>
            </div>

            <div
              id="pwaWindowsCard"
              class="pwaCard"
              @mouseover="platCardHover($event)"
              @mouseleave="platCardUnHover($event)"
            >
              <div class="pwaCardHeaderBlock">
                <i id="platformIcon" class="fab fa-windows"></i>
                <h2>Windows</h2>
              </div>

              <p>
                You'll get a side-loadable version of your PWA (requires Win10
                in dev mode) to test your PWA right away. To generate an AppX
                PWA package and submit to the Microsoft Store, click here
              </p>

              <section class="platformDownloadBar">
                <button
                  class="platformDownloadButton"
                  @click="openWindowsModal()"
                >
                  <i class="fas fa-long-arrow-alt-down"></i>
                </button>
              </section>
            </div>

            <div
              @mouseover="platCardHover($event)"
              @mouseleave="platCardUnHover($event)"
              id="pwaMacosCard"
              class="pwaCard"
            >
              <div class="pwaCardHeaderBlock">
                  <i id="platformIcon" class="fab fa-apple"></i>
                  <h2>MacOS</h2>
              </div>

              <p>
                You can use Xcode to build this package to produce an app that
                runs on MacOS.
              </p>

              <section class="platformDownloadBar">
                <Download
                  class="platformDownloadButton"
                  platform="macos"
                  message="Download"
                />
              </section>
            </div>
          </ul>
        </div>
      </section>
    </section>

    <section id="bottomSection">
      <div id="coolPWAs">
        <h2>Scope out rad PWAs</h2>

        <p>
          Pinterest, Spotify, and more built some PWAs and they are like whoa!
          Check them out by clicking on the image or logos. Love doing PWAs?
          Submit your own!
        </p>

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
        PWA Builder was founded by Microsoft as a community guided, open source
        project to help move PWA adoption forward.
        <a href="https://privacy.microsoft.com/en-us/privacystatement"
          >Our Privacy Statement</a
        >
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

  public samsungDevice: boolean = false;
  public androidDevice: boolean = false;
  public iphoneDevice: boolean = false;
  public pcDevice: boolean = true;
  public macDevice: boolean = false;
  public teamsDevice: boolean = false;

  public created(): void {
    this.updateStatus();
  }

  public mounted(): void {
    const overrideValues = {
      uri: window.location.href,
      pageName: "publishPage",
      pageHeight: window.innerHeight
    };

    this.$awa(overrideValues);
  }

  platCardHover(ev) {
    console.log(ev.target.children[2].children);
    if (ev.target) {
      const parent = ev.target.children[2];

      let targetButton: HTMLButtonElement | null = null;

      if (parent) {
        targetButton = ev.target.children[2].children[0];
      }

      if (targetButton) {
        targetButton.classList.add("platformDownloadButtonHover");
      }
    }
  }

  platCardUnHover(ev) {
    console.log("hello world", ev);

    const targetButton: HTMLButtonElement = ev.target.children[2].children[0];
    console.log(targetButton);

    if (targetButton) {
      targetButton.classList.remove("platformDownloadButtonHover");
    }
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

Vue.prototype.$awa = function(config) {
  console.log(config);
  awa.ct.capturePageView(config);
  return;
};

declare var awa: any;
</script>

<style lang="scss">
/* stylelint-disable */

@import "~assets/scss/base/variables";

#devicePreviews {
  height: 504px;
}

#desktopDevicePreview {
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    width: 24em;
  }
}

#mobileDevicePreview {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 28em;

  svg {
    width: 18em;
    height: 53em;
  }

  img {
    height: 20em;
  }
}

@keyframes publishfadein {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

footer {
  display: flex;
  justify-content: center;
  padding-left: 10px;
  padding-right: 10px;
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

#teamsIconImg {
  height: 40px;
  width: 42px;
}

@media (max-height: 700px) {
  #scorepublishSideBySide header {
    top: 51px;
  }
}

#publishMain {

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
  background: linear-gradient(-32deg, #9337D8, #1FC2C8);

  #publishLeftSide {
    height: 100%;
    flex: 1;

    display: flex;
    justify-content: center;
    align-self: center;
    align-items: center;
    

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
      color: white;
      margin-left: 20px;
      margin-right: 20px;

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
    flex: 2;
    display: flex;
    flex-direction: column;
    background: white;
    align-items: center;
    justify-content: center;
    padding-bottom: 100px;

    #platformsListContainer {
      padding-top: 20px;
      padding-right: 20px;
      padding-left: 20px;
      color: white;

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        display: grid;
        // flex-direction: column;
        // flex-wrap: wrap;

        .pwaCard {
          background: #f0f0f0;
          border-radius: 4px;
          color: #3c3c3c;
          padding-left: 24px;
          padding-right: 24px;
          padding-top: 20px;
          padding-bottom: 40px;
          margin: 10px;
          position: relative;
          transition: box-shadow 0.3s;

          .pwaCardHeaderBlock {
            display: flex;
            align-items: center;
          }

          .pwaCardHeaderBlock h2 {
            font-style: normal;
            font-weight: bold;
            font-size: 16px;
            line-height: 24px;
            color: rgba(60, 60, 60, 0.6);
          }

          .platformDownloadBar {
            position: absolute;
            bottom: 20px;
            right: 20px;
            height: 30px;
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

          .platformDownloadButtonHover {
            border-radius: 50%;
            width: 30px;
            height: 30px;
            border: none;
            background-image: linear-gradient(to right, #1fc2c8, #9337d8 116%);
            color: white;
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
            margin-top: 15px;
          }
        }

        .pwaCard:hover {
          box-shadow: 0 1px 8px 4px #9a989869;
        }

        #pwaMainCard {
          grid-column-start: span 2;
        }

        // #pwaWindowsCard {
        //   #platformIcon {
        //     margin-right: 42px;
        //   }

        //   .pwaCardHeaderBlock {
        //     margin-right: 100px;
        //   }

        //   h2 {
        //     margin-right: -96px;
        //   }
        // }

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

@media (min-width: 1200px) {
  #publishMain {
    height: 100vh;
  }

  #publishSideBySide {
    height: 100vh;
  }
}

@media (max-width: 920px) {
  #publishSideBySide {
    flex-direction: column;
  }

   #publishSideBySide #publishLeftSide  #introContainer {
      margin-top: 20px;
      margin-left: 30px;
      margin-right: 30px;
  }
}

@media (max-width: 550px) {
  #publishSideBySide #publishRightSide #platformsListContainer ul {
      display: flex;
      flex-direction: column;
  }
}
</style>
