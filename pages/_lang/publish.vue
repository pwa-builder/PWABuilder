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
              <span class="button-holder download-archive"><button data-flare="{'category': 'Download', 'action': 'Web', 'label': 'Download Archive', 'value': { 'page': '/download/web' }}" class="pwa-button pwa-button--simple pwa-button--brand">{{ $t('publish.download') }}</button></span>
            </div>
          </div>

          <div class="pure-u-1 pure-u-md-1-2">
            <div class="pwa-infobox-box pwa-infobox-box--flat">
              <h4 class="pwa-infobox-subtitle pwa-infobox-subtitle--thin">{{ $t('publish.windows') }}</h4>
              <p class="l-generator-description l-generator-description--fixed">{{ $t('publish.windows_description') }}</p>
              <span class="button-holder download-archive"><button data-flare="{'category': 'Download', 'action': 'Web', 'label': 'Download Archive', 'value': { 'page': '/download/web' }}" class="pwa-button pwa-button--simple  isEnabled">{{ $t('publish.download') }}</button></span>
              <p><button class="pwa-button pwa-button--simple pwa-button--brand">{{ $t('publish.generate_appx') }}</button></p>
            </div>
          </div>
          <div class="pure-u-1">
            <div class="pwa-infobox-box pwa-infobox-box--flat">
              <div class="pwa-infobox-padded">
                <h4 class="pwa-infobox-subtitle pwa-infobox-subtitle--thin">{{ $t('publish.android') }}</h4>
                <p class="l-generator-description l-generator-description--fixed l-generator-description--context">{{ $t('publish.android_description') }}</p>
                <div>
                  <button data-flare="{'category': 'Download', 'action': 'Web', 'label': 'Download Archive', 'value': { 'page': '/download/web' }}" class="pwa-button pwa-button--simple  isEnabled">{{ $t('publish.download') }}</button>
                </div>
              </div>
              <h2 class="pwa-infobox-subtitle pwa-infobox-subtitle--thin">{{ $t('publish.polyfill') }}l</h2>
              <button data-flare="{'category': 'Download', 'action': 'Web', 'label': 'Download Archive', 'value': { 'page': '/download/web' }}" class="pwa-button pwa-button--simple">{{ $t('publish.download') }}</button></span>
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

import * as publish from '~/store/modules/publish';

const PublishState = namespace(publish.name, State);
const PublishAction = namespace(publish.name, Action);

@Component({
  components: {
    TwoWays,
    GeneratorMenu
  }
})
export default class extends Vue {

  @PublishState status: boolean;

  @PublishAction resetAppData;
  @PublishAction updateStatus;

  public created(): void {
    this.updateStatus();
  }

  public goToHome(): void {
    this.$router.push({
      name: 'index'
    });
  }

  public reset(): void {
    this.resetAppData();
    this.$router.push({
      name: 'index'
    });
  }
}
</script>
