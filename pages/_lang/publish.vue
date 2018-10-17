<template>
  <section>
    <div class="l-generator-step">
      <div class="padding">
        <section id="getStartedBlock">
          <div id="quickTextBlock">
            <h2 id="quickBlockText">Download and publish your shiny new app</h2>

            <p id="quickBlockPlaceholder">You have a few different options to publish your app. You can download the
              files and deploy them to your site, or you can download pre-populated app projects for the major app
              platforms from the links below.</p>
          </div>
        </section>
      </div>
    </div>


    <div class="">
      <div class="downloadSection">
        <section id="downloadForSite">
          <h2>Download these files to add to your site</h2>
          <a href="https://www.microsoft.com">What do I do with these files?</a>

          <div id="lists">

            <h3 id="justTheseText">Download files for Web:</h3>
            <ul id="downloadList">
              <li>
                <input id="manifest" v-model="files" value="manifest" type="checkbox" />
                <label for="manifest">App Manifest</label>
              </li>

              <li>
                <input id="serviceWorkers" v-model="files" value="serviceWorkers" type="checkbox" />
                <label for="serviceWorkers">Service Workers</label>
              </li>

              <li>
                <input id="apiSamples" v-model="files" value="apiSamples" type="checkbox" />
                <label for="apiSamples">API Samples</label>
              </li>

              <li>
                <input id="windows10" v-model="files" value="windows10Package" type="checkbox" />
                <label for="windows10">Windows 10 sideloader</label>
              </li>
            </ul>


            <button @click="downloadFiles" class="work-button">Download</button>
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
            <p>Service Worker support requires RS4 or above. You'll get a copy of each PWAbuilder component as well as
              a side-loadable version of your PWA (requires Win10 in dev mode). The Generate Appx button can be used to
              generate a PWA package to submit to the Microsoft Store.</p>
            <Download platform="windows10" :message="$t('publish.download')" />
          </div>

          <div class="platformCard">
            <h3>iOS</h3>
            <p>
              PWAs are avaiable through the browser on iOS, however your PWA can also be submitted to the app
              store by building the package you get below in Xcode.
            </p>
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
            <h3>mac OS</h3>
            <p>
              You can use Xcode to build this package to produce an app that runs on MacOS.
            </p>
            <Download platform="MacOS" :message="$t('publish.download')" />            
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

  // Set default web checked items
  public files: any[] = ['manifest', 'serviceWorkers', 'apiSamples', 'windows10Package'];

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
/* stylelint-disable */

  @import '~assets/scss/base/variables';

  .padding {
    padding-bottom: 48px;
    padding-left: 68px;
    padding-right: 190px;
    padding-top: 0;
    width: 100%;
  }

  #quickBlockText {
    font-size: 36px;
    line-height: 42px;
    margin: 0;
    width: 500px;
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

    a, a:visited {
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
    display:flex;
    flex-direction: column;
  }

  #downloadForSite {
    width: 40%;
    display: flex;
    flex-direction: column;

    ul {
      margin-left:0;
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
[type="checkbox"]:not(:checked) + label
{
    position: relative;
    padding-left: 32px;
    cursor: pointer;
    line-height: 24px;

}
[type="checkbox"]:checked + label:before,
[type="checkbox"]:not(:checked) + label:before {
    content: '';
    position: absolute;
    left: 5px;
    top: 5px;
    width: 16px;
    height: 16px;
    background-image: url('~/assets/images/unChecked.png');
    background-repeat: no-repeat;
    background-size: 16px;
}
[type="checkbox"]:checked + label:after,
[type="checkbox"]:not(:checked) + label:after {
    content: '';
    width: 16px;
    height: 16px;
    background-image: url('~/assets/images/checked.png');
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
}
</style>

