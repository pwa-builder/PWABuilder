<template>
  <main>
    <ScoreHeader></ScoreHeader>

    <div v-if="modalStatus" id="modalBackground"></div>

    <img id="featuresBG" src="~/assets/images/features_bg.svg">

    <div id="sideBySide">
      <section id="headerSection">
        <div>
          <h1 id="featurePageHeader">Extras</h1>

          <p>Add that special something to supercharge your PWA. These cross-platform features can make your website work more like an app.</p>

          <div id="featureActionsBlock">
            <button @click="clearSelected()" id="clearButton">Clear</button>
            <nuxt-link id="doneButton" to="/reportCard">Done</nuxt-link>
          </div>
        </div>
      </section>
    </div>

    <section id="featureListBlock">
      <FeatureCard
        v-if="samples.length > 0 && !selectedSamples.includes(sample)"
        v-for="sample in samples"
        :sample="sample"
        :key="sample.id"
        v-on:selected="onSelected"
        v-on:removed="onRemoved"
        :showRemoveButton="false"
      ></FeatureCard>

      <FeatureCard
        v-if="selectedSamples.length > 0"
        v-for="sample in selectedSamples"
        :sample="sample"
        :key="sample.id"
        v-on:selected="onSelected"
        v-on:removed="onRemoved"
        :showRemoveButton="true"
      ></FeatureCard>
    </section>

    <section id="fakeCardBlock" v-if="samples.length === 0">
      <div class="fakeCard">
        <Loading active></Loading>
      </div>
      <div class="fakeCard">
        <Loading active></Loading>
      </div>
      <div class="fakeCard">
        <Loading active></Loading>
      </div>
    </section>

    <Modal
      v-on:modalOpened="modalOpened()"
      v-on:modalClosed="modalClosed()"
      v-on:modalSubmit="modalSelected()"
      :showSubmitButton="false"
      title="Add Feature"
      ref="addFeatureModal"
    >
      <div class="feature-viewer">
        <div class="code-samples">
          <div class="code-top">
            <CodeViewer
              code-type="javascript"
              :size="viewerSize"
              :code="loadCode()"
              v-on:editorValue="updateCode($event)"
              v-if="sample"
              :showToolbar="false"
              :showHeader="true"
            >
              <div>{{$t('windows.codeTitle')}}</div>
            </CodeViewer>
          </div>
          <div class="code-bottom">
            <CodeViewer
              code-type="javascript"
              :size="viewerSize"
              :code="sample.source"
              v-if="sample"
              :showToolbar="false"
              :showHeader="true"
            >
              <div>{{$t('windows.sourceTitle')}}</div>
            </CodeViewer>
          </div>
        </div>
      </div>

      <button
        slot="extraButton"
        id="addBundleButton"
        v-on:click="addBundle()"
      >{{ $t("windows.add") }}</button>

      <p v-if="sample" slot="extraP" id="sampleDescP">{{sample.description}}</p>

      <div v-if="sample" class="feature-content" slot="featureContentSlot">
        <div class="side_panel">
          <div class="properties" v-if="sample">
            <h1>Required Properties</h1>

            <div v-for="prop in sample.parms" :key="prop.id">
              <h3>{{prop.name}}</h3>
              <p class="propDescription" :id="prop.id">{{prop.description}}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </main>
</template>

<script lang='ts'>
import Vue from "vue";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

import Modal from "~/components/Modal.vue";
import Loading from "~/components/Loading.vue";
import FeatureCard from "~/components/FeatureCard.vue";
import ScoreHeader from "~/components/ScoreHeader.vue";
import CodeViewer from "~/components/CodeViewer.vue";

import * as windowsStore from "~/store/modules/windows";

const WindowsState = namespace(windowsStore.name, State);
const WindowsAction = namespace(windowsStore.name, Action);

@Component({
  components: {
    Modal,
    Loading,
    FeatureCard,
    ScoreHeader,
    CodeViewer
  }
})
export default class extends Vue {
  error: any;
  hasNative = false;
  public viewerSize = "5rem";
  public viewerSizeBottom = "55rem";
  overallGrade: string | null = null;

  currentPendingSample: windowsStore.Sample | null = null;

  selectedSamples: windowsStore.Sample[] = [];
  @WindowsState sample: windowsStore.Sample;
  @WindowsState samples: windowsStore.Sample[];

  @WindowsAction getSamples;
  @WindowsAction selectSample;

  modalStatus = false;

  async mounted() {
    console.log(this.samples.length);
    await this.getSamples();
    console.log(this.samples);

    const score = sessionStorage.getItem("overallGrade");
    console.log(score);
    if (score) {
      this.overallGrade = score;
    }
  }

  async destroyed() {
    this.modalStatus = false;
  }

  // @ts-ignore TS6133 onSelected
  public async onSelected(sample: windowsStore.Sample) {
    try {
      await this.selectSample(sample);
      // this.selectedSamples.push(sample);
      this.currentPendingSample = sample;

      (this.$refs.addFeatureModal as Modal).show();
    } catch (e) {
      this.error = e;
    }
  }

  public async modalSelected() {
    try {
      console.log("sample selected");
      await this.selectSample(this.currentPendingSample);
      this.selectedSamples.push(this
        .currentPendingSample as windowsStore.Sample);

      // force a re-render
      this.selectedSamples = this.selectedSamples;
      console.log(this.selectedSamples);
    } catch (e) {
      this.error = e;
    }
  }

  public clearSelected() {
    this.selectedSamples = [];
    this.currentPendingSample = null;
  }

  // @ts-ignore TS6133 onSelected
  public onRemoved(sample: windowsStore.Sample) {
    if (this.selectedSamples.indexOf(sample) != -1) {
      sample.usercode = null;

      // We're unchecking the last sample
      if (this.selectedSamples.length == 1) {
        this.hasNative = false;
      }
    } else {
      // We're adding a sample via checkbox
      this.hasNative = true;
    }
  }

  loadCode() {
    let index = this.selectedSamples.indexOf(this.sample);
    if (index != -1 && this.selectedSamples[index].usercode) {
      return this.selectedSamples[index].usercode;
    }

    return this.sample.snippet;
  }

  updateCode(ev) {
    // TODO: Need to pass this into bundle somehow in download method?
    this.sample.usercode = ev;
  }

  async addBundle() {
    try {
      console.log("sample selected", this.currentPendingSample);
      await this.selectSample(this.currentPendingSample);

      if (this.selectedSamples.indexOf(this.sample) == -1) {
        console.log('pushing', this.currentPendingSample);
        this.selectedSamples.push(this
          .currentPendingSample as windowsStore.Sample);
        console.log('selectedSamples', this.selectedSamples);
      }



      this.hasNative = true;
      this.modalClosed();
      (this.$refs.addFeatureModal as Modal).hide();
    } catch (e) {
      this.modalClosed();
      (this.$refs.addFeatureModal as Modal).hide();
      this.error = e;
    }
  }

  async download(all = false) {
    let that = this;
    let items = Array<any>();
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        let fileName = all ? "codebundle.zip" : "sample.zip";
        that.saveAs(fileName, xhttp);
      }
    };

    xhttp.open("POST", `${process.env.apiUrl2}/api/winrt/generate`, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
    xhttp.responseType = "blob";

    if (all) {
      for (let i = 0; i < this.selectedSamples.length; i++) {
        items.push(this.selectedSamples[i]);
      }
    } else {
      items.push(this.sample);
    }

    let results = this.outputProcessor(items);
    xhttp.send(JSON.stringify(results));
  }

  outputProcessor(items) {
    let results = Array<any>();

    for (let i = 0; i < items.length; i++) {
      let item = items[i];

      let newItem = {
        id: item.id,
        url: item.url,
        hash: item.hash,
        parms: Array<any>()
      };

      for (let j = 0; j < item.parms.length; j++) {
        newItem.parms.push({
          id: item.parms[j].id,
          defaultData: item.parms[j].default
        });
      }

      results.push(newItem);
    }

    return { controls: results };
  }

  saveAs(fileName, xhttp) {
    let a = document.createElement("a");
    a.href = window.URL.createObjectURL(xhttp.response);
    a.download = fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
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
@import "~assets/scss/base/animations";

#modalBackground {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: grey;
  opacity: 0.7;
  z-index: 98999;
  animation-name: opened;
  animation-duration: 250ms;
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

#sideBySide {
  display: flex;

  #headerSection {
    flex: 1;
    padding-left: 4em;
    padding-right: 164px;
    padding-top: 40px;

    #featurePageHeader {
      font-size: 32px;
      font-weight: bold;
    }

    p {
      font-size: 18px;
      width: 376px;
      padding-bottom: 30px;
      margin: 0;
    }

    #featureActionsBlock {
      display: flex;
      padding-bottom: 30px;

      #clearButton {
        width: 130px;
        height: 44px;
        border-radius: 22px;
        border: none;
        background: grey;
        font-weight: bold;
        font-size: 18px;
        padding-top: 9px;
        padding-bottom: 11px;
        margin-top: 40px;
        color: white;
        background: $color-brand-secondary;
        margin-right: 10px;
      }

      #doneButton {
        width: 130px;
        height: 44px;
        border-radius: 22px;
        border: none;
        background: grey;
        font-weight: bold;
        font-size: 18px;
        padding-top: 9px;
        padding-bottom: 11px;
        margin-top: 40px;
        color: white;
        background: $color-button-primary-purple-variant;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }

  #scoreSection {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;

    #scoreDiv {
      height: 260px;
      width: 280px;
      background: white;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 92px;
      font-weight: bold;
      border-radius: 32px;
    }
  }
}

#featureListBlock,
#fakeCardBlock {
  display: grid;
  grid-template-columns: auto auto auto;
  padding-left: 4em;
  padding-right: 4em;
  margin-top: 60px;
  margin-bottom: 60px;
  
  .fakeCard {
    display: flex;
    justify-content: center;
    height: 209px;
    align-items: center;
    font-size: 4em;
    background: lightgrey;
  }
}

.code-samples {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  flex: 1;
}

.code-top {
  flex: 1;
  height: 50vh;
}

.code-bottom {
  flex: 1;
  height: 50vh;
}

.properties {
  margin-top: 30px;

  h1 {
    font-weight: bold;
    font-size: 24px;
    margin-bottom: 1.2em;
  }

  h3 {
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 10px;
    margin-top: 30px;
  }

  #sampleDescP {
    margin-top: 20px;
    margin-bottom: 30px;
    font-size: 18px;
  }

  p {
    font-size: 14px;
    max-width: 376px;
  }
}

#bottomCodeHeader {
  background: lightgrey;
  font-weight: bold;
  padding: 1em;
}

#codeHeader {
  background: lightgrey;
  font-weight: bold;
  padding: 1em;
  z-index: 9999;
}

#addBundleButton {
  background: $color-button-primary-purple-variant;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

#featuresBG {
  position: fixed;
  top: 0;
  right: 0;
  z-index: -1;
  height: 100vh;
}

.feature-viewer {
  flex: 1;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 2px;
  background: #f0f0f0;

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
</style>
