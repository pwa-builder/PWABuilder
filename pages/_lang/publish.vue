<template>
  <section>
    <GeneratorMenu/>
    <div v-if="status">
      <div class="pwa-infobox pwa-infobox--transparent l-pad l-pad--thin">
        <div class="pure-g">
          <div class="pure-u-1">
            <h2 class="pwa-infobox-title pwa-infobox-title--centered">{{ $t('publish.title') }}</h2>
          </div>

          <div class="pure-u-1 pure-u-md-1-2">
            <div class="pwa-infobox-box pwa-infobox-box--flat">
              <h4 class="pwa-infobox-subtitle pwa-infobox-subtitle--thin">{{ $t('publish.web') }}</h4>
              <p class="l-generator-description l-generator-description--fixed">
                {{ $t('publish.web_description') }}
              </p>
              <span class="button-holder download-archive"><button data-flare="{'category': 'Download', 'action': 'Web', 'label': 'Download Archive', 'value': { 'page': '/download/web' }}" class="pwa-button pwa-button--simple pwa-button--brand" @click="buildArchive('web')">
                <span v-if="isReady.web">{{ $t('publish.download') }}</span>
                <span v-if="!isReady.web">{{ $t('publish.building_package') }} <Loading :active="true" :size="'sm'" class="u-display-inline_block u-margin-left-sm" /></span>
              </button></span>
            </div>
          </div>

          <div class="pure-u-1 pure-u-md-1-2">
            <div class="pwa-infobox-box pwa-infobox-box--flat">
              <h4 class="pwa-infobox-subtitle pwa-infobox-subtitle--thin">{{ $t('publish.windows') }}</h4>
              <p class="l-generator-description l-generator-description--fixed">{{ $t('publish.windows_description') }}</p>
              <span class="button-holder download-archive"><button data-flare="{'category': 'Download', 'action': 'Web', 'label': 'Download Archive', 'value': { 'page': '/download/web' }}" class="pwa-button pwa-button--simple  isEnabled" @click="buildArchive('windows10')">
                <span v-if="isReady.windows10">{{ $t('publish.download') }}</span>
                <span v-if="!isReady.windows10">{{ $t('publish.building_package') }} <Loading :active="true" :size="'sm'" class="u-display-inline_block u-margin-left-sm" /></span>
              </button></span>
              <p><button class="pwa-button pwa-button--simple pwa-button--brand" @click="openAppXModal()">{{ $t('publish.generate_appx') }}</button></p>
            </div>
          </div>
          <div class="pure-u-1">
            <div class="pwa-infobox-box pwa-infobox-box--flat">
              <div class="pwa-infobox-padded">
                <h4 class="pwa-infobox-subtitle pwa-infobox-subtitle--thin">{{ $t('publish.android') }}</h4>
                <p class="l-generator-description l-generator-description--fixed l-generator-description--context">{{ $t('publish.android_description') }}</p>
                <div>
                  <button data-flare="{'category': 'Download', 'action': 'Web', 'label': 'Download Archive', 'value': { 'page': '/download/web' }}" class="pwa-button pwa-button--simple" @click="buildArchive('android')">
                    <span v-if="isReady.android">{{ $t('publish.download') }}</span>
                <span v-if="!isReady.android">{{ $t('publish.building_package') }} <Loading :active="true" :size="'sm'" class="u-display-inline_block u-margin-left-sm" /></span>
                  </button>
                </div>
              </div>
              <h2 class="pwa-infobox-subtitle pwa-infobox-subtitle--thin">{{ $t('publish.ios') }}l</h2>
              <button data-flare="{'category': 'Download', 'action': 'Web', 'label': 'Download Archive', 'value': { 'page': '/download/web' }}" class="pwa-button pwa-button--simple" @click="buildArchive('ios')">
                <span v-if="isReady.ios">{{ $t('publish.download') }}</span>
                <span v-if="!isReady.ios">{{ $t('publish.building_package') }} <Loading :active="true" :size="'sm'" class="u-display-inline_block u-margin-left-sm" /></span>
              </button></span>
            </div>
          </div>
        </div>
      </div>
      <div class="step">
        <div class="l-generator-buttons l-generator-buttons--centered">
            <button @click="reset" class="pwa-button pwa-button--simple">{{ $t('publish.start_over') }}</button>
        </div>
      </div>
    </div>

    <div class="l-generator-buttons l-generator-buttons--centered" v-if="!status">
      <p class="instructions">{{ $t('publish.manifest_needed') }}</p>
      <button @click="goToHome" class="pwa-button pwa-button--simple">{{ $t('publish.first_step') }}</button>
    </div>
    <TwoWays/>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Action, State, namespace } from 'vuex-class';

import { modules } from '~/store';
import GeneratorMenu from '~/components/GeneratorMenu';
import TwoWays from '~/components/TwoWays';
import Loading from '~/components/Loading';

import * as publish from '~/store/modules/publish';

const PublishState = namespace(publish.name, State);
const PublishAction = namespace(publish.name, Action);

@Component({
  components: {
    TwoWays,
    GeneratorMenu,
    Loading
  }
})
export default class extends Vue {

  public isReady = {
    web: true,
    windows10: true,
    android: true,
    ios: true,
    appx: true
  };

  @PublishState status: boolean;

  @PublishAction resetAppData;
  @PublishAction updateStatus;
  @PublishAction build;

  public created(): void {
    this.updateStatus();
  }

  public goToHome(): void {
    this.$router.push({
      name: 'index'
    });
  }

  public async buildArchive(platform: string): Promise<void> {
    //this.ga('send', 'event', 'item', 'click', 'generator-build-trigger-'+platform);
    this.isReady[platform] = false;
    await this.build(platform);
    this.isReady[platform] = true;
  }

  public openAppXModal(): void {
    //open appX config modal
  }

  public reset(): void {
    this.resetAppData();
    this.$router.push({
      name: 'index'
    });
  }
}
</script>
