<template>
<section>
  <!--<GeneratorMenu/>
  <div v-if="status">
    <div class="pwa-infobox pwa-infobox--transparent l-pad l-pad--thin">
      <div class="pure-g">
        <!--<div class="pure-u-1">
          <h2 class="pwa-infobox-title pwa-infobox-title--centered">{{ $t('publish.title') }}</h2>
        </div>-->

        <!--<div class="pure-u-1 pure-u-md-1-2">
          <div class="pwa-infobox-box pwa-infobox-box--flat">
            <h4 class="pwa-infobox-subtitle pwa-infobox-subtitle--thin">{{ $t('publish.web') }}</h4>
            <p class="l-generator-description l-generator-description--fixed">
              {{ $t('publish.web_description') }}
            </p>
            <span class="button-holder download-archive">
              <Download platform="web" :message="$t('publish.download')" :is-brand="true" />
            </span>
          </div>
        </div>
       <!-- <PublishCard :platform="$t('publish.web')" :description="$t('publish.web_description')">
          <span class="button-holder download-archive">
            <Download platform="web" :message="$t('publish.download')" :is-brand="true" />
          </span>
        </PublishCard>-->

        <!--<div class="pure-u-1 pure-u-md-1-2">
          <div class="pwa-infobox-box pwa-infobox-box--flat">
            <h4 class="pwa-infobox-subtitle pwa-infobox-subtitle--thin">{{ $t('publish.windows') }}</h4>
            <p class="l-generator-description l-generator-description--fixed">{{ $t('publish.windows_description') }}  <a href="http://docs.pwabuilder.com/quickstart/2018/02/03/quick-start-sideload-pwa-win10.html" target="blank">{{ $t('publish.sideload_instructions') }}</a></p>
            <span class="button-holder download-archive">
              <Download platform="windows10" :message="$t('publish.download')" />
            </span>
            <p>
              <button class="pwa-button pwa-button--simple pwa-button--brand" @click="openAppXModal();  $awa( { 'referrerUri': 'https://preview.pwabuilder.com/publish/windows10-appx' })"> {{ $t('publish.generate_appx') }}</button>
            </p>
          </div>
        </div>
        <!--<PublishCard :platform="$t('publish.windows')" :description="$t('publish.windows_description')">
          <span class="button-holder download-archive">
            <Download platform="windows10" :message="$t('publish.download')" />
          </span>
          <p>
            <button class="pwa-button pwa-button--simple pwa-button--brand" @click="openAppXModal();  $awa( { 'referrerUri': 'https://preview.pwabuilder.com/publish/windows10-appx' })"> {{ $t('publish.generate_appx') }}</button>
          </p>
        </PublishCard>-->

        <!--<Modal :title="$t('publish.generate_appx')" ref="appxModal" @submit="onSubmitAppxModal" @cancel="onCancelAppxModal" v-if="appxForm">
          <div class="l-generator-box">
            <label class="l-generator-label">{{ $t('publish.enter_your') }}
              <a href="https://developer.microsoft.com/en-us/windows" target="_blank">{{ $t('publish.dev_center') }}</a> {{ $t('publish.publisher_details') }}</label>
          </div>
          <div class="l-generator-box">
            <label class="l-generator-label">{{ $t('publish.label_publisher') }}</label>
          </div>
          <input class="l-generator-input l-generator-input--largest" :placeholder="$t('publish.placeholder_publisher')" type="text"
            v-model="appxForm.publisher" requied>

          <div class="l-generator-box form-item">
            <label class="l-generator-label">{{ $t('publish.label_identity') }}</label>
            <label class="l-generator-label">{{ $t('publish.label_publisher_id') }}</label>
          </div>
          <input class="l-generator-input l-generator-input--largest" :placeholder="$t('publish.placeholder_identity')" type="text"
            v-model="appxForm.publisher_id" requied>

          <div class="l-generator-box form-item">
            <label class="l-generator-label">{{ $t('publish.label_package') }}</label>
          </div>
          <input class="l-generator-input l-generator-input--largest" :placeholder="$t('publish.placeholder_package')" type="text"
            v-model="appxForm.package" requied>

          <div class="l-generator-box form-item">
            <label class="l-generator-label">{{ $t('publish.label_version') }}</label>
          </div>
          <input class="l-generator-input l-generator-input--largest" :placeholder="$t('publish.placeholder_version')" type="text"
            v-model="appxForm.version" requied>
          <p class="l-generator-error" v-if="appxError"><span class="icon-exclamation"></span> {{ $t(appxError) }}</p>
        </Modal>

        <div class="pure-u-1">
          <div class="pwa-infobox-box pwa-infobox-box--flat">
            <div class="pwa-infobox-padded">
              <h4 class="pwa-infobox-subtitle pwa-infobox-subtitle--thin">{{ $t('publish.android') }}</h4>
              <p class="l-generator-description l-generator-description--fixed l-generator-description--context">{{ $t('publish.android_description') }}</p>
              <div>
                <Download platform="android" :message="$t('publish.download')" />
              </div>
            </div>
            <h2 class="pwa-infobox-subtitle pwa-infobox-subtitle--thin">{{ $t('publish.ios') }}</h2>
            <Download platform="ios" :message="$t('publish.download')" />
          </div>
        </div>
        <!--<section id="mobilePlatformsBar">
          <PublishCard class="mobileCard" :platform="$t('publish.android')" :description="$t('publish.android_description')">
            <div>
              <Download platform="android" :message="$t('publish.download')" />
            </div>
          </PublishCard>
          <PublishCard class="mobileCard" :platform="$t('publish.ios')" :description="$t('publish.ios_description')">
            <div>
              <Download platform="ios" :message="$t('publish.download')" />
            </div>
          </PublishCard>
        </section>-->
      <!--</div>
    </div>
    <StartOver />-
  </div>

  <div class="l-generator-buttons l-generator-buttons--centered" v-if="!status">
    <p class="instructions">{{ $t('publish.manifest_needed') }}</p>
    <button @click="goToHome" class="pwa-button pwa-button--simple">{{ $t('publish.first_step') }}</button>
  </div>-->

    <div class="l-generator-step">
      <div class="pure-g padding">
        <section id="getStartedBlock">
          <div id="quickTextBlock">
            <h2 id="quickBlockText">Ready to publish your app? Let's get started!</h2>

            <p id="quickBlockPlaceholder">You have a few different options to publish your app. You can download the files and deploy them to your site, or you can download pre-populated app projects for the major app platforms from the links below..</p>
          </div>
        </section>
      </div>
    </div>

    <div class="l-generator-step light">
      <div id="whatMakesBlock">
        <div id="goodPWAHeaderBlock">
          <h2 id="quickBlockText">Before we begin?</h2>
          <p>It looks like your app is missing a couple of great features that'll make it even better. These features are super easy to add (we'll even show you how!), and will significantly improve the quality of your app. Use the links below to add these items to your app.</p>
        </div>

        <div id="goodBetterBar">
          <div>
            <h3>Good</h3>
            <ul>
              <li>Uses a fully completed manifest</li>
            </ul>
          </div>

          <div>
            <h3>Better</h3>
            <ul>
              <li>Uses a fully completed manifest</li>
              <li>Uses Service Workers to enable offline use cases</li>
            </ul>
          </div>

          <div>
            <h3>Best</h3>
            <ul>
              <li>Uses a fully completed manifest</li>
              <li>Uses Service Workers to enable offline use cases</li>
              <li>Integrates with native features in the operating system</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="l-generator-step">
      <div class="downloadSection pure-g padding">
        <section id="downloadForSite">
          <h2>Download these files to add to your site</h2>
          <a href="https://www.microsoft.com">What do I do with these files?</a>

          <div id="lists">

            <span id="downloadAllButton">
              <input type="radio" id="downloadAll" />
              <label for="downloadAll">Download All</label>
            </span>

            <div>or</div>

            <ul id="justTheseList">
              <div id="justTheseText">Download Just these files:</div>
              <ul>
                <span>
                  <input id="manifest" type="radio" />
                  <label for="manifest">App Manifest</label>
                </span>

                <span>
                  <input id="serviceWorkers" type="radio" />
                  <label for="serviceWorkers">Service Workers</label>
                </span>

                <span>
                  <input id="apiSamples" type="radio" />
                  <label for="apiSamples">API Samples</label>
                </span>

                <span>
                  <input id="windows10" type="radio" />
                  <label for="windows10">Windows 10 Package</label>
                </span>
              </ul>
            </ul>

            <button id="mainDownloadButton">Download</button>
          </div>
        </section>

        <section id="generateProject">
          <h2>Or let us generate some app projects for you</h2>
          <a href="https://www.microsoft.com">What do I do with these files?</a>
        </section>
      </div>
    </div>
</section>
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
    Toolbar
  }
})
export default class extends Vue {
  public appxForm: publish.AppxParams = {
    publisher: null,
    publisher_id: null,
    package: null,
    version: null
  };

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
  @import '~assets/scss/base/variables';

  .padding {
    padding-bottom: 48px;
    padding-left: 68px;
    padding-right: 190px;
    padding-top: 64px;
    width: 100%;
  }

  #quickBlockText {
    font-size: 32px;
    font-weight: 600;
    margin: 0;
    width: 472px;
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

  #quickTextBlock {
    margin-bottom: 27px;
  }

  #goodPWAHeaderBlock {
    width: 760px;
  }

  #goodBetterBar,
  #otherBar {
    display: flex;
    justify-content: space-between;
  }

  #goodBetterBar h3 {
    font-size: 32px;
    font-weight: 400;
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
    width: 760px;
  }

  #justTheseList,
  #justTheseList ul {
    display: flex;
    flex-direction: column;
  }

  #justTheseList {
    margin-top: 12px;
    padding: 0;
  }

  #justTheseList ul {
    padding-left: 15px;
  }

  #downloadAllButton {
    display: block;
    margin-bottom: 12px;
    margin-top: 44px;
  }

  .downloadSection {
    justify-content: space-between;
  }

  label {
    margin-left: 15px;
  }

  #justTheseText {
    margin-bottom: 16px;
  }

  #mainDownloadButton {
    background: $color-brand;
    border: none;
    border-radius: 20px;
    color: white;
    height: 36px;
    margin-top: 20px;
    width: 138px;
  }
</style>

