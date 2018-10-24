<template>
  <section>
      <div ref='mainDiv' class="l-generator-step">
      <div class="mastHead">
          <h2 class="l-generator-subtitle">{{ $t('windows.title') }}</h2>
        <p class="l-generator-subtitle">{{ $t('windows.summary') }}</p>              
      </div>

        <div class="l-generator-semipadded" v-show="samples.length == 0">
          <p>{{ $t('general.loading') }}</p>
        </div>

        <div class="l-generator-semipadded" v-show="samples != null">

          <div class="generator-section feature-layout">
            <div class="l-generator-field l-generator-field--padded checkbox feature-container" v-for="sample in samples" :key="sample.id">

              <input type="checkbox" v-model="selectedSamples" :value="sample" @click="checkRemoveSample(sample)"/>
              <label class="l-generator-label">
                <img src ="~assets/images/placeHolder.png" class="featureImage" />
                <input type="button" :value="sample" @click="onClickSample(sample)"> 
                <h4>{{sample.title}}</h4>
              </label>
              <p class="l-generator-description">{{ sample.description }}</p>
            </div>

          </div>

          <div class="pure-u-1 pure-u-md-1-2 download">
            <div class="pwa-button pwa-button--simple" v-on:click="download(true)">{{ $t("windows.download_bundle") }}</div>
          </div>

          <div class="l-generator-wrapper pure-u-2-5">       
            <a class="work-button"  @click="onClickShowGBB()" href="#">{{ $t("general.next_page") }}</a>
          </div>

          <p class="download-text">{{ $t('general.github_source') }}
            <a class="" href="https://github.com/pwa-builder/Windows-universal-js-samples/tree/master/win10" target="_blank">GitHub</a>.
          </p>
        </div>
      </div>

      <Modal v-on:modalOpened="modalOpened()" v-on:modalClosed="modalClosed()" title="Add Feature" ref="addFeatureModal">
        <div class="pure-u-1 pure-u-md-2-3">
          <div class="tab_container" >
              <input id="tab1" type="radio" name="tabs" class="tab_input" checked>
              <label for="tab1" class="tab_label"><i class="fa fa-code"></i><span> Usage</span></label>

              <input id="tab2" type="radio" name="tabs" class="tab_input">
              <label for="tab2" class="tab_label"><i class="fa fa-file-alt"></i><span> Code</span></label>

              <section id="content1" class="tab-content tab_section">
                <br/>
                <div class="pure-g">
                  <div class="generate-code pure-u-1 form_container">
                    <CodeViewer :code="loadCode()" v-on:editorValue="updateCode($event)"  v-if="sample" :title="$t('windows.codeTitle')" />
                    <div class="side_panel">
                      <div class="l-generator-form properties" v-if="sample">
                        <div class="l-generator-field" v-for="prop in sample.parms" :key="prop.id">
                          <div class="l-generator-label">{{prop.name}} </div>
                          <div class="l-generator-input value-table" :id="prop.id">{{prop.description}}</div>
                        </div>
                      </div>
                      <div class="pure-u-1 pure-u-md-1-2">
                        <div class="pwa-button pwa-button--simple" v-on:click="addBundle()">{{ $t("windows.add") }}</div>
                      </div>
                      <div class="pure-u-1 pure-u-md-1-2 download">
                        <div class="pwa-button pwa-button--simple" v-on:click="download()">{{ $t("windows.download_sample") }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section id="content2" class="tab-content tab_section">
                <CodeViewer :code="sample.source" v-if="sample" :title="$t('windows.sourceTitle')"/>
                <div class="pwa-button pwa-button--simple pwa-button--brand pwa-button--header" v-on:click="download()">{{ $t("windows.download_sample") }}</div>
              </section>
            </div>
        </div>
      </Modal>

      <Modal v-on:modalOpened="modalOpened()" v-on:modalClosed="modalClosed()" title="Next" ref="nextStepModal">
        <GoodPWA :hasNativeFeatures="hasNative"/>
      </Modal>
  </section>
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Action, State, namespace } from 'vuex-class';

import CodeViewer from '~/components/CodeViewer.vue';
import WindowsMenu from '~/components/WindowsMenu.vue';
import GoodPWA from '~/components/GoodPWA.vue';
import Modal from '~/components/Modal.vue';

import * as windowsStore from '~/store/modules/windows';

const WindowsState = namespace(windowsStore.name, State);
const WindowsAction = namespace(windowsStore.name, Action);

@Component({
  components: {
    CodeViewer,
    WindowsMenu,
    GoodPWA,
    Modal
  }
})

export default class extends Vue {
  error: any;
  viewerSize = '30rem';
  hasNative = false;

  selectedSamples: windowsStore.Sample[] = [];
  @WindowsState sample: windowsStore.Sample;
  @WindowsState samples: windowsStore.Sample[];

  @WindowsAction getSamples;
  @WindowsAction selectSample;

  async created() {
    await this.getSamples();
  }
  
  public onClickShowGBB(): void {
    (this.$refs.nextStepModal as Modal).show();
  }

  async onClickSample(sample: windowsStore.Sample) {
    try {
      await this.selectSample(sample);

      (this.$refs.addFeatureModal as Modal).show();

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
    if (this.selectedSamples.indexOf(this.sample) == -1) {
      this.selectedSamples.push(this.sample);
    }

    this.hasNative = true;

    (this.$refs.addFeatureModal as Modal).hide();
  }

  async download(all = false) {
    let that = this;
    let items = Array<any>();
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            let fileName = all ? 'codebundle.zip' : 'sample.zip';
            that.saveAs(fileName, xhttp);
        }
    };

    xhttp.open('POST', `${process.env.apiUrl2}/api/winrt/generate`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhttp.responseType = 'blob';

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

    return {controls: results};
  }

  saveAs(fileName, xhttp) {
    let a = document.createElement('a');
    a.href = window.URL.createObjectURL(xhttp.response);
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
  }

  public modalOpened() {
    (this.$refs.mainDiv as HTMLDivElement).style.filter = 'blur(25px)';
  }

  public modalClosed() {
    (this.$refs.mainDiv as HTMLDivElement).style.filter = 'blur(0px)';
  }
}
</script>

<style lang="scss" scoped>
/* stylelint-disable */
@import '~assets/scss/base/variables';

.feature-container {
  width: 300px;
  margin: 24px;

  input[type='button'] {
    width: 0;
    height: 0;
    background: transparent;
    font-size: 0;
    border: none;
    cursor: pointer;
  }

  input[type='checkbox'] {
    width: 16px;
    height: 16px;
  }

  h4 {
    font-size: 18px;
    line-height: 24px;
  }
  
  .featureImage {
    width: 100%;
    display: inline-block;
  }

  .l-generator-description {
    font-size: 14px;
    line-height: 18px;
    color: $color-brand-primary;
  }

}

.download-text {
  color: $color-brand-primary;
  font-size: 14px;
  margin-right: 68px;
  text-align: right;

  a, a:visited {
    color: $color-brand-quartary;
  }
}

.feature-layout {
  display: flex;
  width: 100%;
  flex-flow: wrap;
}
.mastHead {
  margin-bottom: 7em;
  margin-left: 68px;
  width: 568px;
  p {
    font-size: 22px;
    line-height: 32px;
    margin-top: 6px;

  }
}


/* Tabs */
.tab_container {
  margin: 0 100px;
  position: absolute;
  width: 90%;
}

.form_container {
  display: flex;
  flex-direction: row;
}

.code_viewer {
  flex: 0 0 50%;
}

.side_panel {
  flex: 0 0 50%;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
}

.tile-table {
  margin: 32px !important;
}

.tab_input,
.tab_section {
  clear: both;
  display: none;
  padding-top: 10px;
}

.tab_label {
  background: #F0F0F0;
  color: #757575;
  cursor: pointer;
  display: block;
  float: left;
  font-size: 18px;
  font-weight: 700;
  padding: 1.5em;
  text-align: center;
  text-decoration: none;
  width: 30%;
}

#tab1:checked ~ #content1,
#tab2:checked ~ #content2 {
  background: #FFFFFF;
  border-bottom: 2px solid #F0F0F0;
  color: #999999;
  display: block;
  flex-wrap: wrap;
  padding: 20px;
}

.tab_container .tab-content div {
  -webkit-animation: fadeInScale .7s ease-in-out;
  -moz-animation: fadeInScale .7s ease-in-out;
  animation: fadeInScale .7s ease-in-out;
}

.tab_container .tab-content h3 {
  text-align: center;
}

.tab_container [id^="tab"]:checked + label {
  background: #FFFFFF;
  box-shadow: inset 0 3px #00CCEE;
}

.tab_label .fa {
  font-size: 1.3em;
  margin: 0 .4em 0 0;
}

.tab_container [id^="tab"]:checked + label .fa {
  color: #00CCEE;
}

/* Media query */
@media only screen and (max-width: 930px) {
  .tab_label span {
    font-size: 14px;
  }

  .tab_label .fa {
    font-size: 14px;
  }
}

@media only screen and (max-width: 768px) {
  .tab_label span {
    display: none;
  }

  .tab_label .fa {
    font-size: 16px;
  }

  .tab_container {
    width: 88%;
  }
}
</style>

<style lang="scss" scoped>
@import "~assets/scss/base/variables";

.generate {
  &-code {
    margin-top: -2rem;
  }
}
</style>