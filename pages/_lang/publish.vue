<template>
  <section>
    <div class="l-generator-step">
      <div class="pure-g padding">
        <section id="getStartedBlock">
          <div id="quickTextBlock">
            <h2 id="quickBlockText">Ready to publish your app? Let's get started!</h2>

            <p id="quickBlockPlaceholder">You have a few different options to publish your app. You can download the
              files and deploy them to your site, or you can download pre-populated app projects for the major app
              platforms from the links below..</p>
          </div>
        </section>
      </div>
    </div>

    <div class="l-generator-step light">
      <div id="whatMakesBlock">
        <div id="goodPWAHeaderBlock">
          <h2 id="quickBlockText">Before we begin?</h2>
          <p>It looks like your app is missing a couple of great features that'll make it even better. These features
            are super easy to add (we'll even show you how!), and will significantly improve the quality of your app.
            Use the links below to add these items to your app.</p>
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
              <input type="checkbox" id="downloadAll" />
              <label for="downloadAll">Download All</label>
            </span>

            <div>or</div>

            <ul id="justTheseList">
              <div id="justTheseText">Download Just these files:</div>
              <ul>
                <span>
                  <input id="manifest" v-model="files" value="manifest" type="checkbox" />
                  <label for="manifest">App Manifest</label>
                </span>

                <span>
                  <input id="serviceWorkers" v-model="files" value="serviceWorkers" type="checkbox" />
                  <label for="serviceWorkers">Service Workers</label>
                </span>

                <span>
                  <input id="apiSamples" v-model="files" value="apiSamples" type="checkbox" />
                  <label for="apiSamples">API Samples</label>
                </span>

                <span>
                  <input id="windows10" v-model="files" value="windows10Package" type="checkbox" />
                  <label for="windows10">Windows 10 Package</label>
                </span>
              </ul>
            </ul>

            <button @click="downloadFiles" class="mainDownloadButton">Download</button>
          </div>
        </section>

        <section id="generateProject">
          <h2>Or let us generate some app projects for you</h2>
          <a href="https://www.microsoft.com">What do I do with these files?</a>

          <div class="platformCard">
            <h3>Windows</h3>
            <p>Service Worker support requires RS4 or above. You'll get a copy of each PWAbuilder component as well as
              a side-loadable version of your PWA (requires Win10 in dev mode). The Generate Appx button can be used to
              generate a PWA package to submit to the Microsoft Store.</p>
            <Download platform="windows10" :message="$t('publish.download')" />
          </div>

          <div class="platformCard">
            <h3>iOS</h3>
            <p>asdf asdf asdf asdf asdf asdf asdf asdf asdf</p>
            <Download platform="ios" :message="$t('publish.download')" />
          </div>

          <div class="platformCard">
            <h3>Android</h3>
            <p>
              PWAs are available through the browser on Android, however your PWA can also be submitted to the play
              store by submitting the package you get below.
            </p>
            <Download platform="android" :message="$t('publish.download')" />
          </div>

          <div class="platformCard">
            <h3>macOS</h3>
            <p>asdf asdf asdf asdf asdf asdf asdf asdf asdf</p>
            <button class="mainDownloadButton">Download</button>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Action, State, namespace } from 'vuex-class';

import GeneratorMenu from '~/components/GeneratorMenu.vue';
import StartOver from '~/components/StartOver.vue';
import Download from '~/components/Download.vue';
import Modal from '~/components/Modal.vue';
import PublishCard from '~/components/PublishCard.vue';
import Toolbar from '~/components/Toolbar.vue';

import * as publish from '~/store/modules/publish';

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

  public files: any[] = [];

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
      path: this.$i18n.path('')
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

  public downloadFiles() {
    console.log(this.files);
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

  .platformCard h3 {
    font-size: 24px;
    font-weight: 400;
    margin-top: 48px;
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

  .mainDownloadButton {
    background: $color-brand;
    border: none;
    border-radius: 20px;
    color: white;
    height: 36px;
    width: 138px;
  }

  .platformCard p {
    font-size: 18px;
    width: 664px;
  }
</style>

