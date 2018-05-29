<template>
<section>
  <GeneratorMenu/>
  <div class="l-generator-step">
    <div class="l-generator-semipadded pure-g">

      <RadioButtonSamples style="width: 50%" :size="sampleSize" :samples="serviceworkers" @sampleChanged="SelectedSampleChanged"/>
  

      <div class="serviceworker-preview pure-u-1 pure-u-md-1-2 generator-section" id="codeBox">
        <CodeViewer :size="viewerSize" :code="webPreview" :title="$t('serviceworker.code_preview_web')">
          <nuxt-link :to="$i18n.path('publish')" class="pwa-button pwa-button--simple pwa-button--brand pwa-button--header" @click=" $awa( { 'referrerUri': 'https://preview.pwabuilder.com/generator-nextStep-trigger'})">
            {{ $t("serviceworker.next_step") }}
          </nuxt-link>
        </CodeViewer>
        <CodeViewer :size="viewerSize" :code="serviceworkerPreview" :title="$t('serviceworker.code_preview_serviceworker')"></CodeViewer>
      </div>
    </div>
  </div>
  <div class="l-generator-buttons l-generator-buttons--centered">
    <nuxt-link :to="$i18n.path('publish')" class="pwa-button" @click=" $awa( { 'referrerUri': 'https://preview.pwabuilder.com/generator-nextStep-trigger'})">
      {{ $t("serviceworker.next_step") }}
    </nuxt-link>
  </div>

  <StartOver />
  <TwoWays/>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Watch } from 'vue-property-decorator';
import { Action, State, namespace } from 'vuex-class';

import GeneratorMenu from '~/components/GeneratorMenu.vue';
import TwoWays from '~/components/TwoWays.vue';
import Loading from '~/components/Loading.vue';
import CodeViewer from '~/components/CodeViewer.vue';
import StartOver from '~/components/StartOver.vue';

import * as serviceworker from '~/store/modules/serviceworker';
import { ServiceWorker } from '~/store/modules/serviceworker';

import RadioButtonSamples from '~/components/RadioButtonSamples.vue';


const ServiceworkerState = namespace(serviceworker.name, State);
const ServiceworkerAction = namespace(serviceworker.name, Action);

@Component({
  components: {
    TwoWays,
    GeneratorMenu,
    Loading,
    StartOver,
    CodeViewer,
    RadioButtonSamples
  }
})

export default class extends Vue {
  public isBuilding = false;
  public serviceworker$: number | null = null;
  public serviceworkers$: ServiceWorker[];
  public error: string | null = null;
  public viewerSize = '25rem';
  public sampleSize = '53rem';
  


  @ServiceworkerState serviceworkers: ServiceWorker[];
  @ServiceworkerState serviceworker: number;
  @ServiceworkerState serviceworkerPreview: string;
  @ServiceworkerState webPreview: string;
  @ServiceworkerState archive: string;

  @ServiceworkerAction downloadServiceWorker;
  @ServiceworkerAction getCode;
  @ServiceworkerAction getServiceworkers;

  async created() {
    await this.getServiceworkers();
    //this.serviceworker$ = this.serviceworkers[0].id;
    //this.changeRBListSize();
  }

  public async download(): Promise<void> {
    this.isBuilding = true;
    try {
      await this.downloadServiceWorker(this.serviceworker$);
    } catch (e) {
      this.error = e;
    }
    if (this.archive) {
      window.location.href = this.archive;
    }
  
    this.$awa( { 'referrerUri': 'https://preview.pwabuilder.com/serviceworker-download' });
    this.isBuilding = false;
  }
  async SelectedSampleChanged(sample) {
    this.serviceworker$ = sample;
        try {
          await  this.getCode(this.serviceworker$.id);
          await this.changeRBListSize();
        } catch (e) {
        this.error = e;
      }
      
   }
  changeRBListSize(){
    const codeBox:any = document.getElementById('codeBox');
    let body:any = document.querySelector('body');
    let fontSize = window.getComputedStyle(body).getPropertyValue('font-size');
    if(codeBox.offsetHeight > 20){
      this.sampleSize = (codeBox.height / parseFloat(fontSize)) + 'px';
    }
  }
}


</script>

<style lang="scss" scoped>
@import "~assets/scss/base/variables";

.serviceworker {
  &-preview {
    margin-top: -2rem;
  }
}
</style>