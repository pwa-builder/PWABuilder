<template>
  <!--<section>
      <div  class="l-generator-step">
      <div class="mastHead">
          <h2>{{ $t('windows.title') }}</h2>
        <p>{{ $t('windows.summary') }}</p>              
      </div>

        <div class="l-generator" v-show="samples.length == 0">
          <p>{{ $t('general.loading') }}</p>

          <div id="loadingCards">
            <div class="skeletonLoadingCard">
              <Loading active/>
            </div>
            <div class="skeletonLoadingCard">
              <Loading active/>
            </div>
            <div class="skeletonLoadingCard">
              <Loading active/>
            </div>
          </div>
        </div>

       <div ref='mainDiv' class="l-generator mainDiv" v-show="samples != null">

          <div class="generator-section feature-layout">
            <div class="l-generator-field checkbox feature-container" v-for="sample in samples" :key="sample.id">

              <input type="checkbox" v-model="selectedSamples" :value="sample" @click="checkRemoveSample(sample)"/>
              <label class="l-generator-label">
                <img  v-if="!sample.image.includes('logo_small')" :src="sample.image" class="featureImage" />
                <img  v-if="sample.image.includes('logo_small')" src="~/assets/images/PWABuilderLogo.svg" class="featureImage"  />
                <input type="button" :value="sample" @click="onClickSample(sample)"> 
                <h4>{{sample.title}}</h4>
              </label>
              <p class="l-generator-description">{{ sample.description }}</p>
            </div>

          </div>

          <div id='buttonsBlock' v-show="samples.length > 0">

            <div class="l-generator-wrapper">       
              <a class="work-button"  @click="onClickShowGBB()" href="#">{{ $t("general.next_page") }}</a>
            </div>
          </div>

          <p class="download-text">{{ $t('general.github_source') }}
            <a class="" href="https://github.com/pwa-builder/Windows-universal-js-samples/tree/master/win10" target="_blank">GitHub</a>.
          </p>
        </div>
      </div>

      <Modal v-on:modalOpened="modalOpened()" v-on:modalClosed="modalClosed()" :showSubmitButton="false" title="Add Feature" ref="addFeatureModal">
        <div class="feature-viewer">
          <div class="feature-content">

            <div class="side_panel">
              <div class="l-generator-form properties" v-if="sample">
                <h1>Required Properties</h1>

                <div class="l-generator-field" v-for="prop in sample.parms" :key="prop.id">
                  <h3 class="l-generator-label">{{prop.name}}</h3>
                  <p class='propDescription' :id="prop.id">{{prop.description}}</p>
                </div>
              </div>

            </div>
          </div>
          <div class="code-samples">
            <div class="code-top">
              <CodeViewer codeType="javascript" :size="viewerSize" :code="loadCode()" v-on:editorValue="updateCode($event)"  v-if="sample" :title="$t('windows.codeTitle')" ></CodeViewer>
            </div>
            <div class="code-bottom">
              <CodeViewer codeType="javascript" :size="viewerSize" :code="sample.source" v-if="sample"  :title="$t('windows.sourceTitle')"/>
            </div>
          </div>
        </div>

            <button slot='extraButton' id='addBundleButton' class="pwa-button pwa-button--simple pwa-button--brand" v-on:click="addBundle()">{{ $t("windows.add") }}</button>
        </div>
      </Modal>

      <Modal v-on:modalOpened="modalOpened()" v-on:modalClosed="modalClosed()" :showButtons="false" title="" ref="nextStepModal">
        <GoodPWA :hasNativeFeatures="hasNative"/>
        <a class="cancelText" href="#" @click="onClickHideGBB(); $awa( { 'referrerUri': 'https://preview.pwabuilder.com/manifest/add-member' });">
        {{$t("modal.goBack")}}
      </a>
      </Modal>
  </section>-->
  <main>
    <ScoreHeader></ScoreHeader>

    <!--<img src="~/assets/images/BG_extras.svg">-->

    <div id="sideBySide">
      <section id="headerSection">
        <div>
          <!--<h1 id="featurePageHeader">{{ $t('windows.title') }}</h1>

          <p id="featurePageInfo">{{ $t('windows.summary') }}</p>-->
          <h1 id="featurePageHeader">Extra Features</h1>

          <p>Add that special something to supercharge your PWA. Consider connecting your website with these API's to enable magical cross-platform experiences.</p>

          <div id="featureActionsBlock">
            <button id="clearButton">clear</button>
            <nuxt-link id="doneButton" to="/reportCard">Done</nuxt-link>
          </div>
        </div>
      </section>
    </div>

    <section id="featureListBlock">
      <!--<div id="featureCard" v-for="sample in samples" :key="sample.id">
        <h4>{{sample.title}}</h4>
        <p>{{ sample.description }}</p>

        <div id="featureCardActionsBlock">
          <button @click="onClickSample(sample)" id="featureCardAddButton">Add</button>
        </div>
      </div>-->
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
      :showSubmitButton="false"
      title="Add Feature"
      ref="addFeatureModal"
    >
      <div class="feature-viewer">
        <div class="feature-content">
          <div class="side_panel">
            <div class="properties" v-if="sample">
              <p id="sampleDescP">{{sample.description}}</p>

              <h1>Required Properties</h1>

              <div v-for="prop in sample.parms" :key="prop.id">
                <h3>{{prop.name}}</h3>
                <p class="propDescription" :id="prop.id">{{prop.description}}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="code-samples">
          <div id="codeHeader">Usage Example</div>
          <div class="code-top">
            <CodeViewer
              code-type="javascript"
              :size="viewerSize"
              :code="loadCode()"
              v-on:editorValue="updateCode($event)"
              v-if="sample"
              :title="$t('windows.codeTitle')"
            ></CodeViewer>
          </div>
          <div class="code-bottom">
            <div id="bottomCodeHeader">Snippit</div>
            <CodeViewer
              code-type="javascript"
              :size="viewerSize"
              :code="sample.source"
              v-if="sample"
              :title="$t('windows.sourceTitle')"
            />
          </div>
        </div>
      </div>

      <button
        slot="extraButton"
        id="addBundleButton"
        v-on:click="addBundle()"
      >{{ $t("windows.add") }}</button>
    </Modal>
  </main>
</template>

<script lang='ts'>
import Vue from "vue";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

/*import CodeViewer from "~/components/CodeViewer.vue";
import WindowsMenu from "~/components/WindowsMenu.vue";
import GoodPWA from "~/components/GoodPWA.vue";*/
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
    /*CodeViewer,
    WindowsMenu,
    GoodPWA,*/
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

  selectedSamples: windowsStore.Sample[] = [];
  @WindowsState sample: windowsStore.Sample;
  @WindowsState samples: windowsStore.Sample[];

  @WindowsAction getSamples;
  @WindowsAction selectSample;

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

  public onClickHideGBB(): void {
    // (this.$refs.nextStepModal as Modal).hide();
  }

  async destroyed() {
    (this.$root.$el.closest("body") as HTMLBodyElement).classList.remove(
      "modal-screen"
    );
  }

  /*public onClickShowGBB(): void {
    // (this.$refs.nextStepModal as Modal).show();
  }*/

  // @ts-ignore TS6133 onSelected
  public async onSelected(sample: windowsStore.Sample) {
    try {
      await this.selectSample(sample);
      this.selectedSamples.push(sample);

      (this.$refs.addFeatureModal as Modal).show();
    } catch (e) {
      this.error = e;
    }
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

  /*async onClickSample(sample: windowsStore.Sample) {
    try {
      console.log(sample);
      await this.selectSample(sample);
      this.selectedSamples.push(sample);

      //  (this.$refs.addFeatureModal as Modal).show();

      // wire up to GBB component
      // user has selected a native feature to add
      ////this.hasNative = true;
    } catch (e) {
      this.error = e;
    }
  }

  async checkRemoveSample(sample: windowsStore.Sample) {
    // Called before removed from collection in model
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
  }*/

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
    if (this.selectedSamples.indexOf(this.sample) == -1) {
      this.selectedSamples.push(this.sample);
    }

    this.hasNative = true;
    this.modalClosed();
    (this.$refs.addFeatureModal as Modal).hide();
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
@import "~assets/scss/base/animations";

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
    padding-left: 164px;
    padding-right: 164px;
    margin-top: 74px;

    #featurePageHeader {
      font-size: 32px;
      font-weight: bold;
    }

    p {
      font-size: 18px;
      width: 376px;
    }

    #featureActionsBlock {
      display: flex;

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
  padding-left: 164px;
  padding-right: 164px;
  margin-top: 60px;

  .fakeCard {
    display: flex;
    justify-content: center;
    height: 209px;
    align-items: center;
    font-size: 4em;
    background: linear-gradient(-45deg, grey, lightgrey, white);
  }
}

.code-samples {
  width: 50%;
  height: 90vh;
  display: flex;
  flex-direction: column;
  margin-top: -3em;
  height: 90vh;
}

.code-top {
  flex: 1;
}

.code-bottom {
  flex: 1;
}

.feature-content {
  width: 50%;
}

.feature-viewer {
  display: flex;
}

.properties {
  padding-left: 2.2em;
  padding-top: 2em;
  padding-right: 11em;

  h1 {
    font-weight: bold;
    font-size: 24px;
    margin-bottom: 1.2em;
  }

  h3 {
    font-weight: bold;
    font-size: 18px;
  }

  #sampleDescP {
    margin-top: 20px;
    margin-bottom: 2em;
    font-size: 18px;
  }

  p {
    font-size: 14px;
  }
}

#bottomCodeHeader {
  background: lightgrey;
  font-weight: bold;
  padding: 1em;
  margin-left: 36px;
  margin-top: 1em;
  margin-right: 2em;
}

#codeHeader {
  background: lightgrey;
  font-weight: bold;
  padding: 1em;
  margin-left: 36px;
  margin-right: 2em;
}

#addBundleButton {
  background: $color-button-primary-purple-variant;
  color: white;
  font-size: 16px;
  font-weight: bold;
}
</style>
