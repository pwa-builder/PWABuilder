<template>
  <div>
    <ScoreHeader></ScoreHeader>
    <main id="sideBySide">
      <section id="leftSide">
        <header class="mastHead">
          <h2>{{ $t("serviceworker.title") }}</h2>
          <p>{{ $t("serviceworker.summary") }}</p>

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

        <div id="doneDiv">
          <button @click="download()" id="downloadSWButton">
            <span v-if="!isBuilding">{{ $t('serviceworker.download') }}</span>
            <span v-if="isBuilding">
              <Loading :active="true" class="u-display-inline_block u-margin-left-sm"/>
            </span>
          </button>
        </div>
      </section>

      <section id="rightSide">
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
          <div>Add this code to your landing page in a &lt;script&gt; tag:</div>
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
          <div>Add this code to a file named "pwabuilder-sw.js" on your site root:</div>
        </CodeViewer>
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
      if (this.serviceworker$) {
        const cleanedSW = this.serviceworker$.toString();

        this.$router.push({
          name: 'reportCard'
        });

        await this.downloadServiceWorker(cleanedSW);
      }
    } catch (e) {
      console.error(e);
      this.error = e;
    }

    if (this.archive) {
      window.location.href = this.archive;
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
      await this.getCode(this.serviceworker$);
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
</script>

<style lang="scss" scoped>
/* stylelint-disable */

@import "~assets/scss/base/variables";

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
        width: 376px;
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

    #downloadSWButton {
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

    #doneDiv {
      display: flex;
      justify-content: center;
    }
  }

  #rightSide {
    flex: 1;
    height: 110vh;
    width: 50%;
    display: flex;
    flex-direction: column;
    padding-top: 2px;
    background: #f0f0f0;
    overflow-y: auto;

    .topViewer {
      height: 50vh;
    }

    .bottomViewer {
      height: 50vh;
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

@media (min-width: 2559px) {
  .inputContainer {
    width: 534px !important;
    margin-top: 30px !important;
  }

  .swDesc {
    width: initial !important;
  }
}

@media (max-width: 1290px) {
  #sideBySide #rightSide .topViewer {
    height: 57vh;
  }

  #rightSide {
    height: 123vh !important;
  }
}
</style>