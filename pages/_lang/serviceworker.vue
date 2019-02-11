<template>
  <div>
    <ScoreHeader></ScoreHeader>
    <main id="sideBySide">
      <!--<div ref='mainDiv' class="mainDiv service-workers">
    <div class="mastHead">
      <h2>{{ $t('serviceworker.title') }}</h2>
      <p>{{ $t('serviceworker.summary') }}</p>
    </div>
    <div class="l-generator-semipadded pure-g">
      <div class="pure-u-1 pure-u-md-1-2 generator-section">

        <form @submit.prevent="download" @keydown.enter.prevent="download">
          <div class="l-generator-field checkbox" v-for="sw in serviceworkers" :key="sw.id">
            <input type="radio" :value="sw.id" v-model="serviceworker$" :disabled="sw.disable" :id="sw.id" />
            <label class="l-generator-label" :for="sw.id">
              <h4>{{ sw.title }} </h4> <span v-if="sw.disable">(coming soon)</span>
            </label>
            <span class="l-generator-description">{{ sw.description }}</span>
          </div>
          <div class="l-generator-wrapper pure-u-2-5">

           
            <a class="work-button"  @click="onClickShowGBB()" href="#">I'm done</a>
          
          </div>
          <div class="pure-u-3-5">
            <p class="l-generator-error" v-if="error"><span class="icon-exclamation"></span> {{ $t(error) }}</p>
          </div>
        </form>

      </div>
      <div class="serviceworker-preview pure-u-1 pure-u-md-1-2 generator-section">
        <CodeViewer codeType="javascript" :size="viewerSize" :code="webPreview" :title="$t('serviceworker.code_preview_web')">
          <nuxt-link :to="$i18n.path('publish')" class="pwa-button pwa-button--simple pwa-button--brand pwa-button--header" @click=" $awa( { 'referrerUri': 'https://preview.pwabuilder.com/generator-nextStep-trigger'})">
            {{ $t("serviceworker.next_step") }}
          </nuxt-link>
        </CodeViewer>
        <CodeViewer class="bottomViewer" codeType="javascript" :size="bottomViewerSize" :code="serviceworkerPreview" :title="$t('serviceworker.code_preview_serviceworker')"></CodeViewer>
            <p class="download-text">{{ $t('serviceworker.download_link') }}
          <a class="" href="https://github.com/pwa-builder/serviceworkers" target="_blank">GitHub</a>.
          </p>
      </div>

    </div>
  </div>

  <!--<Modal title="Next" ref="nextStepModal" @submit="onSubmitIconModal" @cancel="onCancelIconModal">
    <GoodPWA :hasWorker="hasSW"/>
      </Modal>-->
      <!--<Modal v-on:modalOpened="modalOpened()" v-on:modalClosed="modalClosed()" title="" ref="nextStepModal">
    <GoodPWA :hasWorker="hasSW" :hasBetterWorker="betterSW"/>
    <a class="cancelText" href="#" @click="onClickHideGBB(); $awa( { 'referrerUri': 'https://preview.pwabuilder.com/manifest/add-member' });">
      {{$t("modal.goBack")}}
    </a>

      </Modal>-->
      <section id="leftSide">
        <header class="mastHead">
          <h2>{{ $t("serviceworker.title") }}</h2>
          <p>{{ $t("serviceworker.summary") }}</p>

          <div id="doneDiv">
            <!--<button id="doneButton">Done</button>-->
            <nuxt-link
              @click=" $awa( { 'referrerUri': 'https://preview.pwabuilder.com/generator-nextStep-trigger'})"
              id="doneButton"
              to="reportCard"
            >Done</nuxt-link>
          </div>
        </header>

        <div id="inputSection">
          <form @submit.prevent="download" @keydown.enter.prevent="download">
            <div class="inputContainer" v-for="sw in serviceworkers" :key="sw.id">
              <label class="l-generator-label" :for="sw.id">
                <div id="inputDiv">
                  <input
                    type="radio"
                    :value="sw.id"
                    v-model="serviceworker$"
                    :disabled="sw.disable"
                    :id="sw.id"
                  >
                  <h4>{{ sw.title }}</h4>
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
      </section>

      <section id="rightSide">
        <div id="topTitle">Add this code to your landing page in a &lt;script&gt; tag:</div>
        <CodeViewer
          class="topViewer"
          color="#F0F0F0"
          theme="lighter"
          code-type="javascript"
          :size="viewerSize"
          :code="webPreview"
          :title="$t('serviceworker.code_preview_web')"
          :showToolbar="true"
        >
          <nuxt-link
            :to="$i18n.path('publish')"
            class="pwa-button pwa-button--simple pwa-button--brand pwa-button--header"
            @click=" $awa( { 'referrerUri': 'https://preview.pwabuilder.com/generator-nextStep-trigger'})"
          >{{ $t("serviceworker.next_step") }}</nuxt-link>
        </CodeViewer>

        <div id="bottomTitle">Add this code to a file named "pwabuider-sw.js" on your site root:</div>
        <CodeViewer
          class="bottomViewer"
          color="#F0F0F0"
          theme="darker"
          code-type="javascript"
          :size="bottomViewerSize"
          :code="serviceworkerPreview"
          :title="$t('serviceworker.code_preview_serviceworker')"
          :showToolbar="true"
        ></CodeViewer>
      </section>
    </main>
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
import GoodPWA from "~/components/GoodPWA.vue";
import Modal from "~/components/Modal.vue";
import ScoreHeader from "~/components/ScoreHeader.vue";

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
    GoodPWA,
    Modal,
    ScoreHeader
  }
})
export default class extends Vue {
  public isBuilding = false;
  public serviceworker$: number | null = null;
  public serviceworkers$: ServiceWorker[];
  public error: string | null = null;
  public viewerSize = "10rem";
  public bottomViewerSize = "10rem";
  public hasSW = false;
  public betterSW = false;

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
      await this.downloadServiceWorker(this.serviceworker$);
    } catch (e) {
      this.error = e;
    }
    if (this.archive) {
      window.location.href = this.archive;
    }

    this.$awa({
      referrerUri: "https://preview.pwabuilder.com/serviceworker-download"
    });
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
      await this.getCode(this.serviceworker$);
      this.analyze();
    } catch (e) {
      this.error = e;
    }
  }

  public modalOpened() {
    //(this.$refs.mainDiv as HTMLDivElement).style.filter = 'blur(25px)';
    (this.$root.$el.closest("body") as HTMLBodyElement).classList.add(
      "modal-screen"
    );
  }

  public modalClosed() {
    //(this.$refs.mainDiv as HTMLDivElement).style.filter = 'blur(0px)';
    (this.$root.$el.closest("body") as HTMLBodyElement).classList.remove(
      "modal-screen"
    );
  }
}
</script>

<style lang="scss" scoped>
/* stylelint-disable */

@import "~assets/scss/base/variables";

/*.mastHead {
  margin-bottom: 12em;
}

.serviceworker {
  &-preview {
    margin-top: 2rem;
  }
}
.download-text {
  color: $color-button-primary-purple-variant;
  font-size: 14px;
  margin-right: 68px;
  text-align: right;

  a,
  a:visited {
    color: $color-brand-quartary;
  }
}
.serviceworker-preview {
  .code_viewer {
    min-height: 300px;
    max-height: 700px;
    margin-bottom: 100px;
    margin-right: 68px;
  }
  .bottomViewer {
    min-height: 700px;
    max-height: 900px;
  }
}

.service-workers {
  h4 {
    display: block;
  }

  .l-generator-description {
    font-size: 16px;
    line-height: 24px;
    color: $color-button-primary-purple-variant;
    padding-right: 34px;
    display: block;
    margin-bottom: 40px;
  }

  .l-generator-label {
    display: block;
    margin-bottom: 12px;
  }

  [type="radio"]:checked,
  [type="radio"]:not(:checked) {
    opacity: 0;
  }
  [type="radio"]:checked + label,
  [type="radio"]:not(:checked) + label {
    position: relative;
    padding-left: 32px;
    cursor: pointer;
    line-height: 24px;
  }
  [type="radio"]:checked + label:before,
  [type="radio"]:not(:checked) + label:before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 28px;
    height: 28px;
    background-image: url("~/assets/images/unChecked.png");
    background-repeat: no-repeat;
    background-size: 26px;
  }
  [type="radio"]:checked + label:after,
  [type="radio"]:not(:checked) + label:after {
    content: "";
    width: 16px;
    height: 16px;
    background-image: url("~/assets/images/checked.png");
    background-repeat: no-repeat;
    background-size: 16px;
    position: absolute;
    top: 5px;
    left: 5px;
    border-radius: 100%;
    transition: all 0.2s ease;
  }
  [type="radio"]:not(:checked) + label:after {
    opacity: 0;
    transform: scale(0);
  }
  [type="radio"]:checked + label:after {
    opacity: 1;
    transform: scale(1);
  }*/

#sideBySide {
  display: flex;
  justify-content: space-around;
  height: 100vh;

  #leftSide {
    flex: 1;
    background: white;
    height: 100%;

    .mastHead {
      padding-top: 40px;
      padding-right: 100px;
      padding-left: 164px;

      h2 {
        font-size: 36px;
        font-weight: bold;
        color: black;
        width: 376px
      }

      p {
        margin-top: 20px;
        font-size: 18px;
        width: 376px;
      }
    }

    #inputSection {
      padding-right: 100px;
      padding-left: 164px;

      .inputContainer {
        margin-top: 20px;
        cursor: pointer;
        width: 376px;

        .swDesc {
          font-size: 14px;
          font-weight: normal;
          width: 376px;
        }

        #inputDiv {
          display: flex;
          align-items: unset;

          input {
            height: 1.2em;
            flex: 1;
          }

          h4 {
            flex: 22;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            margin-left: 10px;
          }
        }
      }
    }

    #doneDiv {
      display: flex;

      #doneButton {
        background: $color-button-primary-purple-variant;
        width: 184px;
        height: 44px;
        border-radius: 20px;
        border: none;
        font-weight: bold;
        font-size: 18px;
        margin-top: 30px;
        margin-bottom: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
      }
    }
  }

  #rightSide {
    flex: 1;
    height: 104.4vh;
    width: 50%;
    display: flex;
    flex-direction: column;
    padding-top: 2px;
    background: #f0f0f0;
    overflow-y: auto;

    #topTitle {
      background: #f0f0f0;
      font-weight: bold;
      padding: 1em;
      margin-left: 0px;
    }

    #bottomTitle {
      background: #E2E2E2;
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
</style>