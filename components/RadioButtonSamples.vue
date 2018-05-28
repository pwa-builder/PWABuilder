<template>
<section class="section">
  
    <div id="rbHeader" class="rbHeader"> 
      <div class="l-generator-subtitle subtitle" >{{ $t('windows.title') }}</div>
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
import { Action, State, namespace } from 'vuex-class';
import { Prop, Watch, } from 'vue-property-decorator';
import Component from 'nuxt-class-component';
import * as windowsStore from '~/store/modules/windows';
import windows from '~/pages/_lang/windows.vue';
const WindowsAction = namespace(windowsStore.name, Action);

@Component()
export default class extends Vue {
  error:any;
  selectedSample$: windowsStore.Sample | null = null;
  samplesTextFilter:String = '';
  swContainer:any;
  rbHeader:any;
  

  @Prop({ type: Array, default: null })
  public samples;

  @Prop({ type: String, default: 'auto' })
  public size;

    @Prop({ type: String, default: '' })
  public radioButtonList;

  sampleFilter = this.samples;

  mounted(): void{
    this.swContainer = document.getElementById('swContainer');
    this.rbHeader = document.getElementById('rbHeader');
  }

  @Watch('samples')
  onSamplesChanged(){
    this.sampleFilter = this.samples
    this.selectedSample$ = this.samples[0]
  }

  @Watch('selectedSample$')
  onSelectedSample$Changed() {
   this.$emit('sampleChanged', this.selectedSample$)
  }

  onSampleFilterChanged(){
    const filterText = this.samplesTextFilter
    let filterResult = this.samples.filter(function(elem:any){
                          return elem.title.toLowerCase().includes(filterText.toLowerCase())
                          });
    if(filterResult.length < this.samples.length ){
      this.sampleFilter = filterResult;
    }else{
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

<style lang="scss" scoped>
// @import "~assets/scss/base/variables";

// .generate {
//   &-code {
//     margin-top: -2rem;
//   }
// }

</style>
