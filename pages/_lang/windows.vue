<template>
  <section id='section'>
    
      <WindowsMenu />
      <div class='spinner-container' id="containerSpinner" style='background-color: rgba(43, 43, 43, 0.7); display: none;'>
        <div class="lds-ring" id='loadingSpinner' style="display: none;"><div></div><div></div><div></div><div></div></div>
      </div>
        <div class="l-generator-step" id='content'>
          <div class="l-generator-semipadded pure-g">
            <!-- Service Worker Selection -->
            <div class="pure-u-1 pure-u-md-1-3 generator-section service-workers sampleList">

              <RadioButtonSamples :size="sampleSize" :samples="samples" @sampleChanged="SelectedSampleChanged" :radioButtonList="radioBtnList"/>

            </div>
            <div class="pure-u-1 pure-u-md-2-3 codeViewerColumn"  >
              <div class="tab_container" id='codeContainer' >
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
                        <div class="l-generator-form overflowPropList" v-if="selectedSample$" >
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
import RadioButtonSamples from '~/components/RadioButtonSamples.vue';

const WindowsState = namespace(windowsStore.name, State);
const WindowsAction = namespace(windowsStore.name, Action);

@Component({
  components: {CodeViewer, WindowsMenu, RadioButtonSamples}
})



export default class extends Vue {
  error: any;
  viewerSize = '50rem';//30rem
  sampleSize = '55rem';

  spinner:any;
  containerSpinner:any;
  containerCode:any;
  radioBtnList:String = '';
  
  selectedSample$: windowsStore.Sample | null = null;
  sampleFilter:windowsStore.Sample[];
  samplesTextFilter:any = '';
  @WindowsState samples: windowsStore.Sample[];

  @WindowsAction getSamples;
  @WindowsAction selectSample;

  async mounted() {
    this.spinner = document.getElementById('loadingSpinner');
    this.containerSpinner = document.getElementById('containerSpinner');
    this.showLoadingSpinner(true)
    
    await this.getSamples();
          this.changeRBListSize();
  
    this.showLoadingSpinner(false)
    
  }

async SelectedSampleChanged(sample) {
    
    this.showLoadingSpinner(true)
    this.selectedSample$ = sample;
        try {
        await  this.selectSample(this.selectedSample$);
        await  this.changeRBListSize();
        } catch (e) {
        this.error = e;
      }
     this.showLoadingSpinner(false)
      
   }

    showLoadingSpinner(show:boolean){
    console.log("loading spinner")
     if(show){
       this.spinner.style.display = "block";
      this.containerSpinner.style.display = "block";
      
     }else{
       this.spinner.style.display = "none";
       this.containerSpinner.style.display = "none";
    }
   }
  changeRBListSize(){
    const content1:any = document.getElementById('content1');
    const content2:any = document.getElementById('content2');
    if(content1.offsetHeight > 20){
      console.log('content1',content1.style)
      this.sampleSize = content1.offsetHeight + 'px';
      console.log("content1.offsetHeight",content1.offsetHeight)
    }else if(content2.offsetHeight > 20){
      this.sampleSize = content2.offsetHeight + 'px';
      console.log("content2.offsetHeight",content2.offsetHeight)
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
.overflowPropList {
  height: 25vh;
  overflow-y: auto;
}

.sampleList {
  height: 75vh;
}

.codeViewerColumn {
  height: 75vh;
}

/* CSS Loading Spinner */
#loadingSpinner {
  height: 64px;
  left: 50%;
  margin: -75px 0 0 -75px;
  top: 50%;
  width: 64px;
  z-index: 2;
}

#containerSpinner {
  height: 100vh;
  position: absolute;
  width: 100vw;
  z-index: 1;
}

.lds-ring {
  display: inline-block;
  height: 64px;
  position: relative;
  width: 64px;
}

.lds-ring div {
  animation: lds-ring 1.2s cubic-bezier(1, 1, 1, 1) infinite;
  border: 6px solid #FFFFFF;
  border-color: #FFFFFF transparent transparent transparent;
  border-radius: 50%;
  box-sizing: border-box;
  display: block;
  height: 51px;
  margin: 6px;
  position: absolute;
  width: 51px;
}

.lds-ring div:nth-child(1) {
  animation-delay: -1s;
}

.lds-ring div:nth-child(2) {
  animation-delay: -1s;
}

.lds-ring div:nth-child(3) {
  animation-delay: -1s;
}

@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
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
