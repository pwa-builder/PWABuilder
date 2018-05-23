<template>
<section>
    <div style="height: 5rem;"> 
                <div class="l-generator-subtitle" style="margin-bottom: 1px;">{{ $t('windows.title') }}</div>
               <!-- <div> <input type="text" v-model="samplesTextFilter" @keydown="onSampleFilterChanged" placeholder="Search"/></div> -->
              </div>
              <div class="swScroll" id='swContainer'>
                <div class="l-generator-field l-generator-field--padded checkbox" v-for="sample in sampleFilter" :key="sample.id">
                  <label class="l-generator-label">
                   <input type="radio" :value="sample" v-model="selectedSample$"> {{sample.title}}
                  </label>
                  <span class="l-generator-description">{{ sample.description }}</span>
                </div>
                
    </div>
</section>
</template>


<script lang='ts'>
import Vue from 'vue';
import { Action, State, namespace } from 'vuex-class';
import { Prop, Watch, } from 'vue-property-decorator';
import Component from 'nuxt-class-component';
import * as windowsStore from '~/store/modules/windows';

@Component()
export default class extends Vue {
  selectedSample$: windowsStore.Sample | null = null;
  samplesTextFilter:String = '';
   @Prop({ type: Array, default: null })
  public samples;
  sampleFilter = this.samples;


  mounted(): void{
    
  }
  @Watch('samples')
  onSamplesChanged(){
    console.log('thisSamples', this.samples)
    this.sampleFilter = this.samples
    console.log("sampleFulter",this.sampleFilter)
    this.selectedSample$ = this.samples[0]
  }
  // onSampleFilterChanged(){
  //   console.log(this.samplesTextFilter)
  //   const filterText = this.samplesTextFilter
  //   let filterResult = this.samples.filter(function(elem:any){return elem.title.toLowerCase().includes(filterText.toLowerCase())});
  //   console.log("sampleFilter", filterResult)
  //   if(filterResult.length < this.samples.length ){
  //     this.sampleFilter = filterResult;
  //   }else{
  //     this.sampleFilter = this.samples;
  //   }
  // }
  
}


</script>

<!--
<style>
.swScroll {
  overflow-y: auto;
}

// CSS Loading Spinner
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
// Tabs 

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

// Media query 
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
-->