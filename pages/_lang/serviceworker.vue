<template>
<section>
  <GeneratorMenu/>
  <div class="l-generator-step mainDiv service-workers">
    <h2 class="l-generator-subtitle">{{ $t('serviceworker.title') }}</h2>
    <div class="l-generator-semipadded pure-g">
      <div class="pure-u-1 pure-u-md-1-2 generator-section">

        <form @submit.prevent="download" @keydown.enter.prevent="download">
          <div class="l-generator-field checkbox" v-for="sw in serviceworkers" :key="sw.id">
            <input type="radio" :value="sw.id" v-model="serviceworker$" :disabled="sw.disable" :id="sw.id" />
            <label class="l-generator-label" :for="sw.id">
              <h4>{{ sw.title }} </h4> <span v-if="sw.disable">(coming soon)</span>
            </label>
            <span class="l-generator-description">{{ sw.description }}</span>
          </div>
          <div class="l-generator-wrapper pure-u-2-5">

           
            <a class="work-button"  @click="onClickShowGBB()" href="#">I'm done</a>
          
          </div>
          <div class="pure-u-3-5">
            <p class="l-generator-error" v-if="error"><span class="icon-exclamation"></span> {{ $t(error) }}</p>
          </div>
        </form>

      </div>
      <div class="serviceworker-preview pure-u-1 pure-u-md-1-2 generator-section">
        <CodeViewer codeType="javascript" :size="viewerSize" :code="webPreview" :title="$t('serviceworker.code_preview_web')">
          <nuxt-link :to="$i18n.path('publish')" class="pwa-button pwa-button--simple pwa-button--brand pwa-button--header" @click=" $awa( { 'referrerUri': 'https://preview.pwabuilder.com/generator-nextStep-trigger'})">
            {{ $t("serviceworker.next_step") }}
          </nuxt-link>
        </CodeViewer>
        <CodeViewer class="bottomViewer" codeType="javascript" :size="bottomViewerSize" :code="serviceworkerPreview" :title="$t('serviceworker.code_preview_serviceworker')"></CodeViewer>
            <p class="download-text">{{ $t('serviceworker.download_link') }}
          <a class="" href="https://github.com/pwa-builder/serviceworkers" target="_blank">GitHub</a>.
          </p>
      </div>

    </div>
  </div>

    <!--<Modal :title="Next" ref="nextStepModal" @submit="onSubmitIconModal" @cancel="onCancelIconModal">
      <GoodPWA :hasManifest="basicManifest" :hasBetterManifest="betterManifest"/>
    </Modal>-->

</section>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Watch } from 'vue-property-decorator';
import { Action, State, namespace } from 'vuex-class';

import GeneratorMenu from '~/components/GeneratorMenu.vue';
import Loading from '~/components/Loading.vue';
import CodeViewer from '~/components/CodeViewer.vue';
import StartOver from '~/components/StartOver.vue';
import GoodPWA from '~/components/GoodPWA.vue';
import Modal from '~/components/Modal.vue';

import * as serviceworker from '~/store/modules/serviceworker';
import { ServiceWorker } from '~/store/modules/serviceworker';

const ServiceworkerState = namespace(serviceworker.name, State);
const ServiceworkerAction = namespace(serviceworker.name, Action);

@Component({
  components: {
    GeneratorMenu,
    Loading,
    StartOver,
    CodeViewer,
    GoodPWA,
    Modal
  }
})

export default class extends Vue {
  public isBuilding = false;
  public serviceworker$: number | null = null;
  public serviceworkers$: ServiceWorker[];
  public error: string | null = null;
  public viewerSize = '25rem';
  public bottomViewerSize = '55rem'

  @ServiceworkerState serviceworkers: ServiceWorker[];
  @ServiceworkerState serviceworker: number;
  @ServiceworkerState serviceworkerPreview: string;
  @ServiceworkerState webPreview: string;
  @ServiceworkerState archive: string;

  @ServiceworkerAction downloadServiceWorker;
  @ServiceworkerAction getCode;
  @ServiceworkerAction getServiceworkers;

  async mounted() {
    await this.getServiceworkers();
    this.serviceworker$ = this.serviceworkers[0].id;
    await this.getCode(this.serviceworker$);
  }

  public onClickShowGBB(): void {
    (this.$refs.nextStepModal as Modal).show();
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

  @Watch('serviceworker$')
  async onServiceworker$Changed() {
    try {
      await this.getCode(this.serviceworker$);
    } catch (e) {
      this.error = e;
    }
  }
}
</script>

<style lang="scss" scoped>
/* stylelint-disable */

@import "~assets/scss/base/variables";

.serviceworker {
  margin-top: 2rem;

  &-preview {
    margin-top: 2rem;
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
.serviceworker-preview {

  .code_viewer {
    min-height:300px;
    max-height: 700px;
    margin-bottom: 100px;
    margin-right: 68px;
  }
  .bottomViewer {
      min-height:  700px;
      max-height: 900px;
    }
}
.service-workers {
  margin-top: 100px;

  h2 {
    margin: 0 0 100px 68px;
    width: 400px;
  }

  .l-generator-subtitle {
    margin-bottom: 150px;
  }

  h4 {
    display: block;
  }
 
  .l-generator-description {
    font-size: 16px;
    line-height: 24px;
    color: $color-brand-primary;
    padding-right: 34px;
    display:block;
    margin-bottom: 40px;
  }

  .l-generator-label {
    display: block;
    margin-bottom: 12px;
  }

[type="radio"]:checked,
[type="radio"]:not(:checked) {
    opacity: 0;
}
[type="radio"]:checked + label,
[type="radio"]:not(:checked) + label
{
    position: relative;
    padding-left: 32px;
    cursor: pointer;
    line-height: 24px;

}
[type="radio"]:checked + label:before,
[type="radio"]:not(:checked) + label:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 28px;
    height: 28px;
    background-image: url('~/assets/images/unChecked.png');
    background-repeat: no-repeat;
    background-size: 26px;
}
[type="radio"]:checked + label:after,
[type="radio"]:not(:checked) + label:after {
    content: '';
    width: 16px;
    height: 16px;
    background-image: url('~/assets/images/checked.png');
    background-repeat: no-repeat;
    background-size: 16px;
    position: absolute;
    top: 5px;
    left: 5px;
    border-radius: 100%;
    transition: all 0.2s ease;
}
[type="radio"]:not(:checked) + label:after {
    opacity: 0;
    transform: scale(0);
}
[type="radio"]:checked + label:after {
    opacity: 1;
    transform: scale(1);
}
}
</style>