<template>
  <section class="section" >
    <div class="containerList" :style="{ height: sizeContainer }" style="margin-bottom: 10px;">
    <div id="rbHeader" class="rbHeader"> 
        <div class="l-generator-subtitle subtitle">{{ title }}</div>
        <div><input type="text" v-model="samplesTextFilter" @keydown="onSampleFilterChanged" placeholder="Search"/></div>
    </div>
    <div class="swContainer" id='swContainer':style="{ height: sizeSWContainer }" >
      <div class="l-generator-field l-generator-field--padded checkbox" v-for="sample in sampleFilter" :key="sample.id">
        <label class="l-generator-label">
                    <input type="radio" :value="sample" v-model="selectedSample$" :disabled="sample.disable" > {{sample.title}} <span v-if="sample.disable">(coming soon)</span>
        </label>
        <span class="l-generator-description">{{ sample.description }}</span>
      </div>
    </div>
    </div>
  </section>
</template>

<script lang='ts'>
import Vue from 'vue';
import { Prop, Watch, } from 'vue-property-decorator';
import Component from 'nuxt-class-component';
import * as windowsStore from '~/store/modules/windows';

@Component()
export default class extends Vue {
  error: any;
  selectedSample$: windowsStore.Sample | null = null;
  samplesTextFilter: String = '';
  sampleFilter = this.samples;
  sizeSWContainer: String = 'auto';
  sizeContainer: String = this.size;
  
  @Prop({ type: Array, default: null })
  public samples;

  @Prop({ type: String, default: 'auto' })
  public size;

  @Prop({ type: String, default: '' })
  public title;

  @Watch('samples')
  onSamplesChanged() {
    this.sampleFilter = this.samples;
    this.selectedSample$ = this.samples[0];   
  }

  @Watch('selectedSample$')
  onSelectedSample$Changed() {
   this.$emit('sampleChanged', this.selectedSample$);
  }

  @Watch('size')
  onSizeChanged() {
    let screenH: Number = window.screen.availHeight;
    let screenW: Number = window.screen.availWidth;
    const header: any = document.getElementById('rbHeader');
    
    if(screenW <= 767){
      this.sizeContainer = '330px';
      this.sizeSWContainer = '250px';
    } else {
      this.sizeSWContainer = (parseInt(this.size) - header.offsetHeight) + 'px'; 
    }
  }

  onSampleFilterChanged() {
    const filterText = this.samplesTextFilter;
    let filterResult = this.samples.filter(function(elem: any) {return elem.title.toLowerCase().includes(filterText.toLowerCase())});
    
    if (filterResult.length < this.samples.length ) {
      this.sampleFilter = filterResult;
    } else {
      this.sampleFilter = this.samples;
    }
  }
}
</script>

<style>
@media only screen and (max-width: 767px) {
  .containerList {
    height: 330px !important;
    margin-bottom: 10px !important;
  }

  .swContainer {
    height: 250px !important;
  }
}

.subtitle {
  margin-bottom: 3%;
}

.rbHeader {
  padding-bottom: 5px;
}

.section {
  height: 100%;
}

.swContainer {
  overflow-y: auto;
  padding-bottom: 10px;
}
</style>
