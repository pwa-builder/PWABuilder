<template>
  <section>
    <GeneratorMenu/>
      <div class="l-generator-step">
        <div class="l-generator-semipadded pure-g">
          <div class="pure-u-1 pure-u-md-1-2 generator-section service-workers">
            <div class="l-generator-subtitle">{{ $t('serviceworker.title') }}</div>
            <form @submit.prevent="download" @keydown.enter.prevent="download">
              <div class="l-generator-field l-generator-field--padded checkbox">
                <label class="l-generator-label">
                  <input type="radio" value="1" v-model="serviceWorker">
                  {{ $t('serviceworker.titles.offline_page') }}
                </label>

                <span class="l-generator-description">{{ $t('serviceworker.descriptions.offline_page') }}</span>
              </div>

              <div class="l-generator-field l-generator-field--padded checkbox">
                <label class="l-generator-label">
                  <input type="radio" value="2" v-model="serviceWorker">
                  {{ $t('serviceworker.titles.offline_copy') }}
                </label>

                <span class="l-generator-description">{{ $t('serviceworker.descriptions.offline_copy') }}</span>
              </div>

              <div class="l-generator-field l-generator-field--padded checkbox">
                <label class="l-generator-label">
                  <input type="radio" value="3" v-model="serviceWorker">
                  {{ $t('serviceworker.titles.offline_copy_backup') }}
                </label>

                <span class="l-generator-description">{{ $t('serviceworker.descriptions.offline_copy_backup') }}</span>
              </div>

              <div class="l-generator-field l-generator-field--padded checkbox">
                <label class="pwa-generator-label">
                  <input type="radio" value="4" v-model="serviceWorker">
                  {{ $t('serviceworker.titles.cache_first') }}
                </label>

                <span class="l-generator-description">{{ $t('serviceworker.descriptions.cache_first') }}</span>
              </div>

              <div class="l-generator-field l-generator-field--padded checkbox">
                <label class="l-generator-label">
                  <input type="radio" value="5" disabled="" v-model="serviceWorker">
                  {{ $t('serviceworker.titles.advanced') }}
                </label>

                <span class="l-generator-description">{{ $t('serviceworker.descriptions.advanced') }}</span>
              </div>

              <button data-flare="{'category': 'Download', 'action': 'Web', 'label': 'Download Archive', 'value': { 'page': '/download/web' }}" class="pwa-button pwa-button--simple isEnabled">
                <span v-if="!isBuilding">{{ $t('serviceworker.download') }}</span>
                <span v-if="isBuilding">{{ $t('serviceworker.building') }} <Loading :active="true" :size="'sm'" class="u-display-inline_block u-margin-left-sm" /></span>
              </button>
            </form>
            <p>{{ $t('serviceworker.download_link') }} <a class="l-generator-link" href="https://github.com/pwa-builder/serviceworkers" target="_blank">GitHub</a>.</p>
          </div>
          <div class="pure-u-1 pure-u-md-1-2 generator-section manifest manifest-holder">
            Code for website
          </div>
        </div>
      </div>
    <TwoWays/>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Action, State, namespace } from "vuex-class";
import { modules } from "~/store";
import GeneratorMenu from '~/components/GeneratorMenu';
import TwoWays from '~/components/TwoWays';
import Loading from '~/components/Loading';

const ServiceworkerState = namespace(modules.serviceworker.name, State);
const ServiceworkerAction = namespace(modules.serviceworker.name, Action);

@Component({
  components: {
    TwoWays,
    GeneratorMenu,
    Loading
  }
})
export default class extends Vue {
  public isBuilding = false;
  public serviceWorker: number = 1;

  @ServiceworkerState error: string;

  @ServiceworkerAction downloadServiceWorker;

  public async download(): Promise<void> {
    this.isBuilding = true;
    await this.downloadServiceWorker(this.serviceWorker);
    //this.ga('send', 'event', 'item', 'click', 'serviceworker-download');
    this.isBuilding = false;
  }
}
</script>
