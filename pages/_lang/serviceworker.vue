<template>
  <div>
    <HubHeader :showSubHeader="true"></HubHeader>

    <main id="sideBySide">
      <section id="leftSide">
        <header class="mastHead" id="swHeader">
          <h2>{{ $t("serviceworker.title") }}</h2>
          <p>{{ $t("serviceworker.summary") }}</p>

          <button id="pushLink" @click="openPushModal()">
            <img src="/Images/test.png"></img>
            Add support for push notifications
          </button>

          <div v-if="openModal" id="pushModal">
            <div id="pushModalBackground"></div>

            <div id="pushModalContent">
              <div id="pushModalContentHeader">
                <h3>Setup Push Notifications</h3>
                <p id="pushHeaderP">Is this a new or existing setup?</p>
              </div>

              <div id="pushModalContentOptions">
                <nuxt-link to="/push">
                  <img src="/Images/newSetup.png"></img>

                  <div>
                    <h4>Create a New Setup</h4>
                    <p>Create a new push notification setup</p>
                  </div>
                </nuxt-link>

                <nuxt-link to="/test">
                  <img src="/Images/pushTest.png"></img>

                  <div>
                    <h4>Test Push Notifications</h4>
                    <p>Already setup push notifications? Test them out here</p>
                  </div>
                </nuxt-link>
              </div>

              <div id="pushModalCancelWrapper">
                <button id="pushModalCancel" @click="closePushModal()">Cancel</button>
              </div>

            </div>
          </div>
        </header>

        <div id="inputSection">
          <form @submit.prevent="download" @keydown.enter.prevent="download">
            <div
              id="inputContainer"
              v-for="sw in serviceworkers"
              :key="sw.title"
              @click="selectServiceWorker(sw.id)"
              v-bind:class="{ active: serviceworker$ === sw.id }"
            >
              <label class="l-generator-label" :for="sw.id">
                <div id="inputDiv">
                  <!--<input
                    type="radio"
                    :value="sw.id"
                    v-model="serviceworker$"
                    :disabled="sw.disable"
                    :id="sw.id"
                  >-->

                  <div id="titleBox">
                    <h4>{{ sw.title }}</h4>

                    <!--<i v-pre v-if="serviceworker$ === sw.id" class="fas fa-check"></i>-->
                  </div>

                  <span v-if="sw.disable">(coming soon)</span>
                </div>
              </label>
              <div class="swDesc">{{ sw.description }}</div>
            </div>
            <div class="pure-u-3-5">
              <p class="l-generator-error" v-if="error">
                <span class="icon-exclamation"></span>
                {{ $t(error) }}
              </p>
            </div>
          </form>
        </div>

        <div id="doneDiv">
          <button @click="download()" id="downloadSWButton">
            <span v-if="!isBuilding">{{ $t("serviceworker.download") }}</span>
            <span v-if="isBuilding">
              <Loading
                :active="true"
                class="u-display-inline_block u-margin-left-sm"
              />
            </span>
          </button>
        </div>
      </section>

      <section id="rightSide" class="swRightSide">
        <CodeViewer
          class="topViewer"
          color="#F0F0F0"
          theme="lighter"
          code-type="javascript"
          :size="viewerSize"
          :code="webPreview"
          :title="$t('serviceworker.code_preview_web')"
          :showToolbar="false"
          :showHeader="true"
        >
          <h3>Add this code to your landing page in a &lt;script&gt; tag:</h3>
        </CodeViewer>

        <CodeViewer
          class="bottomViewer"
          color="#F0F0F0"
          theme="darker"
          code-type="javascript"
          :size="bottomViewerSize"
          :code="serviceworkerPreview"
          :title="$t('serviceworker.code_preview_serviceworker')"
          :showToolbar="false"
          :showHeader="true"
        >
          <h3>
            Add this code to a file named "pwabuilder-sw.js" on your site root:
          </h3>
        </CodeViewer>
      </section>
    </main>

    <footer>
      <p>
        PWA Builder was founded by Microsoft as a community guided, open source
        project to help move PWA adoption forward.
        <a href="https://privacy.microsoft.com/en-us/privacystatement"
          >Our Privacy Statement</a
        >
      </p>
    </footer>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";
import { Watch } from "vue-property-decorator";
import { Action, State, namespace } from "vuex-class";

import GeneratorMenu from "~/components/GeneratorMenu.vue";
import Loading from "~/components/Loading.vue";
import CodeViewer from "~/components/CodeViewer.vue";
import StartOver from "~/components/StartOver.vue";
import Modal from "~/components/Modal.vue";
import HubHeader from "~/components/HubHeader.vue";

import * as serviceworker from "~/store/modules/serviceworker";
import { ServiceWorker } from "~/store/modules/serviceworker";

const ServiceworkerState = namespace(serviceworker.name, State);
const ServiceworkerAction = namespace(serviceworker.name, Action);

@Component({
  components: {
    GeneratorMenu,
    Loading,
    StartOver,
    CodeViewer,
    Modal,
    HubHeader
  }
})
export default class extends Vue {
  public isBuilding = false;
  public serviceworker$: number = 0;
  public serviceworkers$: ServiceWorker[];
  public error: string | null = null;
  public viewerSize = "10rem";
  public bottomViewerSize = "10rem";
  public hasSW = false;
  public betterSW = false;
  public openModal: boolean = false;

  @ServiceworkerState serviceworkers: ServiceWorker[];
  @ServiceworkerState serviceworker: number;
  @ServiceworkerState serviceworkerPreview: string;
  @ServiceworkerState webPreview: string;
  @ServiceworkerState archive: string;

  @ServiceworkerAction downloadServiceWorker;
  @ServiceworkerAction getCode;
  @ServiceworkerAction getServiceworkers;

  async created() {
    await this.getServiceworkers();
    this.serviceworker$ = this.serviceworkers[0].id;
    await this.getCode(this.serviceworker$);
  }

  mounted() {
    const overrideValues = {
      isAuto: false,
      behavior: 0,
      uri: window.location.href,
      pageName: "serviceWorkerPage",
      pageHeight: window.innerHeight
    };

    awa.ct.capturePageView(overrideValues);
  }

  openPushModal() {
    console.log('hello world', !this.openModal);
    this.openModal = !this.openModal;
  }

  closePushModal() {
    this.openModal = false;
  }

  public selectServiceWorker(id: number) {
    console.log(id);
    this.serviceworker$ = id;
  }

  async destroyed() {
    (this.$root.$el.closest("body") as HTMLBodyElement).classList.remove(
      "modal-screen"
    );
  }

  public onClickShowGBB(): void {
    (this.$refs.nextStepModal as Modal).show();
    this.analyze();
  }

  public onClickHideGBB(): void {
    (this.$refs.nextStepModal as Modal).hide();
  }

  public async download(): Promise<void> {
    this.isBuilding = true;
    try {
      if (this.serviceworker$) {
        const cleanedSW = this.serviceworker$.toString();
        await this.downloadServiceWorker(cleanedSW);
      }
    } catch (e) {
      console.error(e);
      this.error = e;
    }

    if (this.archive) {
      window.location.href = this.archive;
    } else {
      console.error("no archive");
    }

    this.isBuilding = false;
  }

  public analyze(): void {
    if (this.serviceworker$ && this.serviceworker$ >= 4) {
      this.betterSW = true;
    } else if (this.serviceworker$ && this.serviceworker$ < 4) {
      // default to true for now
      this.hasSW = true;
    }
  }

  @Watch("serviceworker$")
  async onServiceworker$Changed(): Promise<void> {
    try {
      console.log(this.serviceworker$);

      // temp check for demo
      if (this.serviceworker$ === 6 || this.serviceworker$ === 7) {
        await this.getCode(4);
      } else {
        await this.getCode(this.serviceworker$);
      }

      this.analyze();
    } catch (e) {
      this.error = e;
    }
  }

  public modalOpened() {
    (this.$root.$el.closest("body") as HTMLBodyElement).classList.add(
      "modal-screen"
    );
  }

  public modalClosed() {
    (this.$root.$el.closest("body") as HTMLBodyElement).classList.remove(
      "modal-screen"
    );
  }
}

declare var awa: any;
</script>

<style lang="scss" scoped>
/* stylelint-disable */

@import "~assets/scss/base/variables";

footer {
  display: flex;
  justify-content: center;
  padding-left: 15%;
  padding-right: 15%;
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

#swHeader {
  margin-bottom: 40px;
}

#pushLink {
  color: #9337d8;
  font-weight: bold;
  font-size: 12px;
  line-height: 28px;

  display: flex;
  align-items: center;

  cursor: pointer;
  background: none;
}

#pushLink img {
  margin-right: 16px;
  height: 40px;
}

#pushModal {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

#pushModalBackground {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(51, 58, 83, 0.61);
  backdrop-filter: blur(59px);
  z-index: 0;
}

#pushModalContent {
  background: #FFFFFF;
  box-shadow: 0px 25px 26px rgba(32, 36, 50, 0.25), 0px 5px 9px rgba(51, 58, 83, 0.53);
  border-radius: 10px;

  padding-left: 30px;
  padding-right: 30px;
  padding-bottom: 22px;
  padding-top: 24px;

  z-index: 2;
}

#pushModalContentHeader h3 {
  font-weight: 700;
  font-size: 24px;
  line-height: 36px;
  letter-spacing: -0.02em;
  color: #3C3C3C;
}

#pushModalContent #pushModalContentHeader #pushHeaderP {
  color: #3C3C3C;
  font-size: 16px;
  line-height: 22px;
  margin-top: 8px;
  margin-bottom: 18px;
}

#pushModalContentOptions {
  display: flex;
  flex-direction: column;
}

#pushModalContentOptions a {
  display: flex;
  align-items: center;
  margin-left: 20px;
  margin-right: 126px;
  max-width: 350px;
  margin-bottom: 29px;
}

#pushModalContentOptions a h4 {
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  line-height: 22px;
  color: #9337D8;
}

#pushModalContentOptions a p {
  color: #3C3C3C;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
}

#pushModalContentOptions a h4, #pushModalContentOptions a p {
  margin-bottom: 0;
  margin-top: 0 !important;
}

#pushModalContentOptions a img {
  margin-right: 17px;
}

#pushModalCancelWrapper {
  display: flex;
  justify-content: center;
}

#pushModalCancelWrapper button {
  background: none;
  color: #3C3C3C;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  opacity: 0.6;
}

#sideBySide {
  display: flex;
  justify-content: space-between;
  height: 100%;
  padding-right: 3%;
  padding-left: 3%;
  background: white;

  #leftSide {
    background: white;

    .mastHead {
      padding-top: 40px;

      h2 {
        font-family: Poppins;
        font-style: normal;
        font-weight: 600;
        font-size: 24px;
        line-height: 54px;
        letter-spacing: -0.02em;
      }

      p {
        margin-top: 16px;
        font-size: 16px;
        line-height: 28px;
      }
    }

    #inputSection {
      #inputContainer {
        cursor: pointer;
        border-radius: 4px;
        padding-top: 24px;
        padding-bottom: 24px;
        padding-left: 28px;
        padding-right: 28px;

        .swDesc {
          font-style: normal;
          font-weight: normal;
          font-size: 14px;
          line-height: 21px;
        }

        #inputDiv {
          display: flex;
          align-items: unset;

          input {
            height: 1.2em;
            flex: 1;
          }

          #titleBox {
            display: flex;
            justify-content: space-between;
          }

          #titleBox svg {
            height: 24px;
            margin-left: 10px;
            font-size: 16px;
            color: #9337d8;
          }

          h4 {
            flex: 22;
            margin-bottom: 10px;

            font-style: normal;
            font-weight: bold;
            font-size: 16px;
            line-height: 24px;
          }
        }
      }

      .active {
        background: #f0f0f0;

        h4 {
          color: #9337d8;
        }
      }
    }

    @media (max-width: 425px) {
      #inputSection {
        margin-left: initial;
      }
    }

    #downloadSWButton {
      background: #3c3c3c;
      width: 128px;
      height: 44px;
      border-radius: 20px;
      border: none;
      font-family: Poppins;
      font-style: normal;
      font-weight: 600;
      font-size: 14px;
      margin-top: 30px;
      margin-bottom: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
    }

    #doneDiv {
      display: flex;
      justify-content: center;
    }
  }

  #rightSide {
    display: flex;
    flex-direction: column;
    padding-top: 2px;
    background: white;

    .topViewer {
      margin-top: 40px;
    }

    .bottomViewer {
      margin-top: 20px;
    }

    #topTitle {
      background: #f0f0f0;
      font-weight: bold;
      padding: 1em;
      margin-left: 0px;
    }

    #bottomTitle {
      background: #e2e2e2;
      font-weight: bold;
      padding: 1em;
      margin-left: 0px;
      margin-top: -24em;
      z-index: 99;
    }

    .code_viewer {
      background: #f0f0f0;
    }
  }
}

#rightSide {
  width: 55%;
  max-height: 80%;
}
#leftSide {
  width: 40%;
}

@media (max-width: 1180px) {
  #rightSide {
    display: none !important;
  }
  #leftSide {
    width: 100%;
  }

  #sideBySide {
    flex-direction: column;
    padding-left: 31px !important;
    padding-right: 24px !important;
  }

  #sideBySide #leftSide {
    width: initial;
  }

  #sideBySide #leftSide #inputSection #inputContainer {
    padding-left: 14px;
    padding-right: 14px;
  }
}
</style>
