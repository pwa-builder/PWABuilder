<template>
  <main>
    <HubHeader></HubHeader>

    <div v-if="modalStatus" id="modalBackground"></div>

    <section id="headerSection">
      <div>
        <h1 id="featurePageHeader">Features</h1>

        <p>Add that special something to supercharge your PWA. These cross-platform features can make your website work more like an app.</p>
      </div>
    </section>

    <div ref="scrollTarget" id="scrollTarget"></div>
    <div id="featureTabsBar" ref="featureTabsBar">
      <button v-bind:class="{ active: showAllSamplesBool }" @click="showAllSamples()">All</button>
      <button v-bind:class="{ active: showPWASamples }" @click="pwaSamples()">Device / PWA</button>
      <button v-bind:class="{ active: showGraphSamples }" @click="graphSamples()">Microsoft Graph</button>
      <button v-bind:class="{ active: showAuthSamples }" @click="showAuthSamplesMethod()">Authentication</button>
      <button v-bind:class="{ active: showEduSamples }" @click="showEduSamplesMethod()">Education</button>
      <!--<button v-bind:class="{ active: showSamsungSamples }" @click="doSamsungSamples()">Samsung</button>
      <button v-bind:class="{ active: showTeamsSamples }" @click="doTeamsSamples()">Microsoft Teams</button>-->
    </div>

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
      <div class="fakeCard">
        <Loading active></Loading>
      </div>
      <div class="fakeCard">
        <Loading active></Loading>
      </div>
      <div class="fakeCard">
        <Loading active></Loading>
      </div>
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

    <section v-if="showAllSamplesBool" id="featureListBlock">
      <FeatureCard
        v-if="samples.length > 0 && !selectedSamples.includes(sample)"
        v-for="sample in samples"
        :sample="sample"
        :key="sample.id"
        v-on:removed="onRemoved"
        :showRemoveButton="false"
        :showAddButton="true"
        :wrapText="true"
      >
        <i slot="iconSlot" class="fas fa-rocket"></i>
      </FeatureCard>
    </section>

    <section v-if="showPWASamples" id="featureListBlock">
      <FeatureCard
        v-if="cleanedPWASamples.length > 0 && !selectedSamples.includes(sample)"
        v-for="sample in cleanedPWASamples"
        :sample="sample"
        :key="sample.id"
        v-on:removed="onRemoved"
        :showRemoveButton="false"
        :showAddButton="true"
        :wrapText="true"
      >
        <i slot="iconSlot" class="fas fa-rocket"></i>
      </FeatureCard>

      <FeatureCard
        v-if="selectedSamples.length > 0"
        v-for="sample in selectedSamples"
        :sample="sample"
        :key="sample.id"
        v-on:removed="onRemoved"
        :showRemoveButton="true"
        :showAddButton="true"
        :wrapText="true"
      >
        <i slot="iconSlot" class="fas fa-rocket"></i>
      </FeatureCard>
    </section>

    <section v-if="showAuthSamples" id="featureListBlock">
      <FeatureCard
        v-if="authSamples.length > 0 && !selectedSamples.includes(sample)"
        v-for="sample in authSamples"
        :sample="sample"
        :key="sample.id"
        v-on:removed="onRemoved"
        :showRemoveButton="false"
        :showAddButton="true"
        :wrapText="true"
      >
        <i slot="iconSlot" class="fas fa-rocket"></i>
      </FeatureCard>
    </section>

    <section v-if="showGraphSamples" id="featureListBlock">
      <FeatureCard
        v-if="sortedGraphSamples.length > 0 && !selectedSamples.includes(sample)"
        v-for="sample in sortedGraphSamples"
        :sample="sample"
        :key="sample.id"
        v-on:removed="onRemoved"
        :showRemoveButton="false"
        :showAddButton="true"
        :wrapText="true"
      >
        <i slot="iconSlot" class="fas fa-rocket"></i>
      </FeatureCard>
    </section>

    <section v-if="showEduSamples" id="featureListBlock">
      <FeatureCard
        v-if="eduSamples.length > 0 && !selectedSamples.includes(sample)"
        v-for="sample in eduSamples"
        :sample="sample"
        :key="sample.id"
        v-on:removed="onRemoved"
        :showRemoveButton="false"
        :showAddButton="true"
        :wrapText="true"
      >
        <i slot="iconSlot" class="fas fa-rocket"></i>
      </FeatureCard>
    </section>

    <section v-if="showBusSamples" id="featureListBlock">
      <FeatureCard
        v-if="busSamples.length > 0 && !selectedSamples.includes(sample)"
        v-for="sample in busSamples"
        :sample="sample"
        :key="sample.id"
        v-on:removed="onRemoved"
        :showRemoveButton="false"
        :showAddButton="true"
        :wrapText="true"
      >
        <i slot="iconSlot" class="fas fa-rocket"></i>
      </FeatureCard>
    </section>

    <!--<section class="toolkitBlock" id="headerSection">
      <div id="graphToolkitSection" ref="toolkitSection">
        <div>
          <div id="toolkitHeaderDiv">
            <h1 id="featurePageHeader">Microsoft Graph Toolkit</h1>
          </div>

          <p>The Microsoft Graph Toolkit is a collection of framework-agnostic web components and helpers for accessing and working with Microsoft Graph. All components can access Microsoft Graph without any customization required.</p>

          <div id="graphActions">
            <a
              id="graphStartedA"
              href="https://docs.microsoft.com/en-us/graph/toolkit/overview"
            >Get Started</a>

            <nuxt-link
              v-bind:to="`/feature/${'Microsoft Graph Authentication'}`"
              id="authStartedA"
            >Auth With Graph</nuxt-link>
            <nuxt-link
              v-bind:to="`/feature/${'Microsoft Graph Contacts API'}`"
              id="authStartedA"
            >Get Contacts</nuxt-link>
          </div>
        </div>
        <div>
          <h1 id="graphExampleHeader">Example</h1>

          <script async src="//jsfiddle.net/metulev/9phqxLd5/embed/html,result/"></script>
        </div>
      </div>
    </Modal>-->

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

<script lang='ts'>
import Vue from "vue";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

import Loading from "~/components/Loading.vue";
import FeatureCard from "~/components/FeatureCard.vue";
import HubHeader from "~/components/HubHeader.vue";
// import CodeViewer from "~/components/CodeViewer.vue";

import * as windowsStore from "~/store/modules/windows";

const WindowsState = namespace(windowsStore.name, State);
const WindowsAction = namespace(windowsStore.name, Action);

@Component({
  components: {
    // Modal,
    Loading,
    FeatureCard,
    HubHeader
    // CodeViewer
  }
})
export default class extends Vue {
  error: any;
  hasNative = false;
  public viewerSize = "5rem";
  public viewerSizeBottom = "55rem";
  overallGrade: string | null = null;
  showPWASamples = false;
  showAuthSamples = false;
  showEduSamples = false;
  showBusSamples = false;
  showGraphSamples = false;
  showAllSamplesBool = true;
  showSamsungSamples = false;
  showTeamsSamples = false;

  currentPendingSample: windowsStore.Sample | null = null;

  selectedSamples: windowsStore.Sample[] = [];
  authSamples: any[] = [];
  cleanedPWASamples: any[] = [];
  eduSamples: any[] = [];
  busSamples: any[] = [];
  sortedGraphSamples: any[] = [];
  sortedSamsungSamples: any[] = [];
  sortedTeamsSamples: any[] = [];

  @WindowsState sample: windowsStore.Sample;
  @WindowsState samples: windowsStore.Sample[];

  @WindowsAction getSamples;
  @WindowsAction selectSample;

  modalStatus = false;

  async mounted() {

    await this.getSamples();

    const score = sessionStorage.getItem("overallGrade");

    if (score) {
      this.overallGrade = score;
    }

    this.doInterObserve();

    const overrideValues = {
      uri: window.location.href,
      pageName: "featuresPage",
      pageHeight: window.innerHeight
    };

    this.$awa(overrideValues);
  }

  doInterObserve() {
    let observer = new IntersectionObserver((entries) => {
      if (this.$refs && this.$refs.featureTabsBar) {
        if (entries[0].isIntersecting) {
          (this.$refs.featureTabsBar as HTMLElement).style.background = 'transparent';
        }
        else {
          (this.$refs.featureTabsBar as HTMLElement).style.background = '#36363633';
        }
      }
    });

    observer.observe((this.$refs.scrollTarget as Element));
  }

  doTeamsSamples() {
    this.sortedTeamsSamples = this.samples.filter(sample => {
      if ((sample.title as string).toLowerCase().includes("teams")) {
        return sample;
      }
    });

    this.showPWASamples = false;
    this.showAuthSamples = false;
    this.showEduSamples = false;
    this.showBusSamples = false;
    this.showAllSamplesBool = false;
    this.showGraphSamples = false;
    this.showSamsungSamples = false;
    this.showTeamsSamples = true;
  }

  doSamsungSamples() {
    this.sortedSamsungSamples = this.samples.filter(sample => {
      if ((sample.title as string).toLowerCase().includes("samsung")) {
        return sample;
      }
    });

    this.showPWASamples = false;
    this.showAuthSamples = false;
    this.showEduSamples = false;
    this.showBusSamples = false;
    this.showAllSamplesBool = false;
    this.showGraphSamples = false;
    this.showSamsungSamples = true;
    this.showTeamsSamples = false;
  }

  pwaSamples() {
    this.cleanedPWASamples = this.samples.filter(sample => {
      if((sample.title as string).toLowerCase().includes("graph") === false) {
        return sample;
      }
    });

    this.showPWASamples = true;
    this.showAuthSamples = false;
    this.showEduSamples = false;
    this.showBusSamples = false;
    this.showAllSamplesBool = false;
    this.showGraphSamples = false;
    this.showSamsungSamples = false;
    this.showTeamsSamples = false;
  }

  graphSamples() {
    this.sortedGraphSamples = this.samples.filter(sample => {
      if ((sample.title as string).toLowerCase().includes("graph") === true || (sample.title as string).toLowerCase().includes("adaptive cards")) {
        return sample;
      }
    });

    this.showPWASamples = false;
    this.showAuthSamples = false;
    this.showEduSamples = false;
    this.showBusSamples = false;
    this.showAllSamplesBool = false;
    this.showGraphSamples = true;
    this.showSamsungSamples = false;
    this.showTeamsSamples = false;
  }

  showAllSamples() {
    this.showAllSamplesBool = true;

    this.showPWASamples = false;
    this.showAuthSamples = false;
    this.showEduSamples = false;
    this.showBusSamples = false;
    this.showGraphSamples = false;
    this.showSamsungSamples = false;
    this.showTeamsSamples = false;
  }

  showAuthSamplesMethod() {
    this.authSamples = this.samples.filter(sample =>
      (sample.title as string).toLowerCase().includes("authentication") || (sample.title as string).toLowerCase().includes("contacts")
      || (sample.title as string).toLowerCase().includes("people") || (sample.title as string).toLowerCase().includes("person")
      || (sample.title as string).toLowerCase().includes("login")
    );

    this.showAuthSamples = true;
    this.showPWASamples = false;
    this.showEduSamples = false;
    this.showBusSamples = false;
    this.showAllSamplesBool = false;
    this.showGraphSamples = false;
    this.showSamsungSamples = false;
    this.showTeamsSamples = false;
  }

  showEduSamplesMethod() {
    this.eduSamples = this.samples.filter(sample => {
      if ((sample.title as string).toLowerCase().includes("graph") || (sample.title as string).toLowerCase().includes("midi")) {
        return sample;
      }
    });

    this.showAuthSamples = false;
    this.showPWASamples = false;
    this.showEduSamples = true;
    this.showBusSamples = false;
    this.showAllSamplesBool = false;
    this.showGraphSamples = false;
    this.showSamsungSamples = false;
    this.showTeamsSamples = false;
  }

  showBusSamplesMethod() {
    this.busSamples = this.samples.filter(sample => {
      if ((sample.title as string).toLowerCase().includes("graph") ||
       (sample.title as string).toLowerCase().includes('install') ||
       (sample.title as string).toLowerCase().includes('clipboard')
      ) {

        return sample;
      }
    });

    this.showAuthSamples = false;
    this.showPWASamples = false;
    this.showEduSamples = false;
    this.showBusSamples = true;
    this.showAllSamplesBool = false;
    this.showGraphSamples = false;
    this.showSamsungSamples = false;
    this.showTeamsSamples = false;
  }

  scrollToToolkit() {
    (this.$refs.toolkitSection as Element).scrollIntoView({
      behavior: "smooth"
    });
  }

  async destroyed() {
    this.modalStatus = false;
  }

  // @ts-ignore TS6133 onSelected
  /* public async onSelected(sample: windowsStore.Sample) {
    try {
      await this.selectSample(sample);
      // this.selectedSamples.push(sample);
      this.currentPendingSample = sample;
      // this.currentPendingSample = sample;

      (this.$refs.addFeatureModal as Modal).show();
    } catch (e) {
      this.error = e;
    }
  }*/

  public async modalSelected() {
    try {
      await this.selectSample(this.currentPendingSample);
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
    window.scrollTo(0, 0);
    this.modalStatus = true;
  }

  public modalClosed() {
    this.modalStatus = false;
  }
}

Vue.prototype.$awa = function(config) {
  awa.ct.capturePageView(config);
  return;
};

declare var awa: any;
</script>

<style lang="scss" scoped>
/* stylelint-disable */
@import "~assets/scss/base/variables";
@import "~assets/scss/base/animations";

#scrollTarget {
    width: 100%;
    height: 1em;
    pointer-events: none;
  }

#featureTabsBar {
  display: flex;
  justify-content: center;
  align-items: center;
  position: sticky;
  top: 0;
  flex-wrap: wrap;
}

#featureTabsBar button {
  background: linear-gradient(
    270deg,
    rgb(36, 36, 36) 23.15%,
    rgb(60, 60, 60) 57.68%
  );
  color: white;
  font-family: sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  border: none;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 20px;
  margin: 10px;
  width: 158px;
}

#featureTabsBar button.active {
  background: linear-gradient(270deg, #622392 17.15%, #9337d8 52.68%);
}

#seeMoreBlock {
  position: fixed;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 4em;
  background: linear-gradient(
    180deg,
    rgba(240, 240, 240, 0) 0%,
    #f0f0f0 50.38%
  );
}

#seeMoreBlock button {
  background: linear-gradient(
    270deg,
    rgb(36, 36, 36) 23.15%,
    rgb(60, 60, 60) 57.68%
  );
  color: white;
  font-family: sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  border: none;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 20px;
}

footer {
  display: flex;
  justify-content: center;
  padding-left: 15%;
  padding-right: 15%;
  font-size: 12px;
  color: rgba(60, 60, 60, 0.5);
  background: #F0F0F0;
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

#modalBackground {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: lightgrey;
  opacity: 0.7;
  z-index: 98999;
  animation-name: opened;
  animation-duration: 250ms;
  will-change: opacity;
}

#featureListBlock .card {
  margin: 10px;
}

#fakeCardBlock .fakeCard {
  margin: 10px;
}

main {
  @include backgroundRightPoint(80%, 50vh);
  height: 100%;
}

@media (max-height: 500px) {
  main {
    @include backgroundRightPoint(80%, 40vh);
  }
}

@media (max-height: 425px) {
  main {
    @include backgroundRightPoint(80%, 10vh);
  }
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

#headerSection {
  padding-left: 159px;
  padding-right: 159px;

  h1 {
    color: white;

    margin-top: 48px;
    margin-bottom: 16px;
    font-family: sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 24px;
    line-height: 54px;
    letter-spacing: -0.02em;
  }

  p {
    color: white;

    font-style: normal;
    font-weight: normal;
    font-size: 16px;
    line-height: 28px;
  }
}

@media (max-width: 1336px) {
  #headerSection {
    padding-left: 52px;
    padding-right: 35px;
  }
}

@media (max-width: 430px) {
  #headerSection {
    padding-left: 28px;
    padding-right: 28px;
  }
}

#featureListBlock,
#fakeCardBlock {
  display: flex;
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 24px;
  margin-bottom: 104px;
  justify-content: center;
  padding-left: 12px;
  padding-right: 12px;

  .fakeCard {
    display: flex;
    justify-content: center;
    height: 209px;
    width: 320px;
    align-items: center;
    font-size: 4em;
    background: white;
  }
}

#featureListBlock .card {
  width: 320px;
}

@media (max-width: 1024px) {
  #featureListBlock .card {
    width: 280px;
  }
}

.code-samples {
  display: flex;
  flex-direction: column;
  height: 100%;
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
  height: 100%;
}

.feature-viewer {
  flex: 1;
  height: 100%;
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

#graphToolkitSection {
  display: flex;
  justify-content: space-between;

  background: white;
  border-radius: 4px;
  padding-left: 2em;
  padding-right: 2em;
  padding-bottom: 3em;
  margin-bottom: 2em;
  color: black;
}

#graphExampleHeader {
  color: black !important;
}

#graphToolkitSection #graphStartedA {
  border-radius: 22px;
  border: none;
  display: flex;
  justify-content: center;
  padding-left: 20px;
  padding-right: 20px;
  font-family: sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  display: flex;
  align-items: center;
  text-align: center;
  height: 40px;
  width: 132px;
  background: white;
  margin-top: 2em;
}

#graphToolkitSection > div {
  flex: 1;
}

#graphToolkitSection p {
  width: 538px;
  color: black;
}

#toolkitHeaderDiv {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 520px;
}

#toolkitHeaderDiv h1 {
  color: black;
}

#toolkitHeaderDiv a {
  color: black;
  margin-top: 28px;
}

#graphActions {
  display: flex;
  align-items: center;
}

#authStartedA {
  border-radius: 22px;
  border: none;
  display: flex;
  justify-content: center;
  padding-left: 20px;
  padding-right: 20px;
  font-family: sans-serif;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  display: flex;
  align-items: center;
  text-align: center;
  height: 40px;
  width: 158px;
  background: black;
  margin-top: 2em;
  color: white;
  margin-left: 12px;
}
</style>
