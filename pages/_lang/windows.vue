<template>
  <section>
    <WindowsMenu />
      <div class="l-generator-step">
        <div class="l-generator-semipadded pure-g">
          <div class="pure-u-1 pure-u-md-1-3 generator-section service-workers">
            <div class="l-generator-subtitle">{{ $t('windows.title') }}</div>
            <div class="l-generator-field l-generator-field--padded checkbox" v-for="sample in samples" :key="sample.id">
              <label class="l-generator-label">
                <input type="radio" :value="sample" v-model="selectedSample$"> {{sample.title}}
              </label>
              <span class="l-generator-description">{{ sample.description }}</span>
            </div>
          </div>
          <div class="pure-u-1 pure-u-md-2-3">
            <div class="tab_container" >
                <input id="tab1" type="radio" name="tabs" class="tab_input" checked>
                <label for="tab1" class="tab_label"><i class="fa fa-code"></i><span> Usage</span></label>

                <input id="tab2" type="radio" name="tabs" class="tab_input">
                <label for="tab2" class="tab_label"><i class="fa fa-file-alt"></i><span> Code</span></label>

                <section id="content1" class="tab-content tab_section">
                  <br/>
                  <div class="pure-g">
                    <div class="generate-code pure-u-1">
                      <CodeViewer :code="selectedSample$.snippet" v-if="selectedSample$" :title="$t('windows.codeTitle')" />
                      <br/>
                      <div class="l-generator-form " v-if="selectedSample$">
                        <div class="l-generator-field" v-for="prop in selectedSample$.parms" :key="prop.id">
                          <div class="l-generator-label">{{prop.name}} </div>
                          <div class="l-generator-input value-table" :id="prop.id">{{prop.description}}</div>
                        </div>
                      </div>
                      <div class="pure-u-1 pure-u-md-1-2">
                        <div class="pwa-button pwa-button--simple" v-on:click="download()">{{ $t("windows.download") }}</div>
                      </div>
                    </div>
                  </div>
                </section>
                <section id="content2" class="tab-content tab_section">
                  <CodeViewer :size="viewerSize" :code="selectedSample$.source" v-if="selectedSample$" :title="$t('windows.sourceTitle')">
                    <div class="pwa-button pwa-button--simple pwa-button--brand pwa-button--header" v-on:click="download()">{{ $t("windows.download") }}</div>      
                  </CodeViewer>
                </section>
              </div>
          </div>
        </div>
      </div>
  </section>
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Action, State, namespace } from 'vuex-class';
import { Watch } from 'vue-property-decorator';
import CodeViewer from '~/components/CodeViewer.vue';
import WindowsMenu from '~/components/WindowsMenu.vue';

import * as windowsStore from '~/store/modules/windows';

const WindowsState = namespace(windowsStore.name, State);
const WindowsAction = namespace(windowsStore.name, Action);

@Component({
  components: {CodeViewer, WindowsMenu}
})

export default class extends Vue {
  error: any;
  viewerSize = '30rem';

  selectedSample$: windowsStore.Sample | null = null;
  @WindowsState samples: windowsStore.Sample[];

  @WindowsAction getSamples;
  @WindowsAction selectSample;

  async created() {
    await this.getSamples();
    this.selectedSample$ = this.samples[0];
  }

  @Watch('selectedSample$')
  async onSelectedSample$Changed() {
    try {
      await this.selectSample(this.selectedSample$);
    } catch (e) {
      this.error = e;
    }
  }

  async download() {
    let that = this;
    let items = Array<any>();
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            let fileName = 'sample.zip';
            that.saveAs(fileName, xhttp);
        }
    };

    xhttp.open('POST', `${process.env.apiUrl2}/api/winrt/generate`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhttp.responseType = 'blob';

    items.push(this.selectedSample$);
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
}
</script>

<style>
/* Tabs */
.tab_container {
  margin: 0 auto;
  position: relative;
  width: 100%;
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
    width: 98%;
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