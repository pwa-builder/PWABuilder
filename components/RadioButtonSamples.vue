<template>
  <section class="section">
    <div id="rbHeader" class="rbHeader"> 
      <div> 
        <input type="text" v-model="samplesTextFilter" @keydown="onSampleFilterChanged" placeholder="Search"/>
      </div>
    </div>
    <div class="swContainer" id='swContainer' :style="{ height: size }">
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
import { Prop, Watch, } from 'vue-property-decorator';
import Component from 'nuxt-class-component';
import * as windowsStore from '~/store/modules/windows';

@Component()
export default class extends Vue {
  error: any;
  selectedSample$: windowsStore.Sample | null = null;
  samplesTextFilter: String = '';
  rbHeader: any;
  sampleFilter = this.samples;
  
  @Prop({ type: Array, default: null })
  public samples;

  @Prop({ type: String, default: 'auto' })
  public size;

  @Watch('samples')
  onSamplesChanged() {
    this.sampleFilter = this.samples;
    this.selectedSample$ = this.samples[0];   
  }

  @Watch('selectedSample$')
  onSelectedSample$Changed() {
   this.$emit('sampleChanged', this.selectedSample$);
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

.subtitle {
  margin-bottom: 3%;
}

.rbHeader {
  height: 5em;
}

.section {
  height: 100%;
}

.swContainer {
  overflow-y: auto;
}
</style>
