<template>
  <section>
    <GeneratorMenu/>
    <div class="l-generator-step">
      <div class="pure-g l-generator-padded">
        <div class="pure-u-1 pure-u-md-3-5 pure-u-lg-2-5">
          <header class="l-generator-header l-generator-header--minimal">
            <h2 class="l-generator-title">{{ $t('generator.title') }}</h2>
            <h4 class="l-generator-subtitle">
              {{ $t('generator.subtitle') }}
            </h4>
          </header>

          <div class="l-generator-form">
            <form @submit.prevent="checkUrlAndGenerate" @keydown.enter.prevent="checkUrlAndGenerate">
              <div class="l-generator-field">
                <label class="l-generator-label" for="siteUrl">{{ $t('generator.url') }}</label>
                <input 
                  class="l-generator-input"
                  :placeholder="$t('generator.placeholder_url')"
                  name="siteUrl" id="siteUrl"
                  type="text"
                  ref="url"
                  v-model="url$">
              </div>

              <div class="pure-g l-breath">
                <div class="l-generator-wrapper pure-u-3-5">
                    <button
                      type="submit"
                      class="get-started pwa-button isEnabled next-step"
                      data-flare="{'category': 'Build', 'action': 'Step 2', 'label': 'Scan for Manifest', 'value': { 'page': '/build/manifest-scan' }}" >
                      {{ $t('generator.start') }} <Loading :active="inProgress" class="u-display-inline_block u-margin-left-sm" />
                    </button>
                </div>

                <div class="pure-u-2-5">
                   <p class="l-generator-error">{{error}}</p>
                </div>

                <div class="l-generator-wrapper pure-u-1">
                  <button 
                    @click="skipCheckUrl"
                    class="pwa-button pwa-button--simple" 
                    data-flare="{'category': 'Skip', 'action': 'Manifest', 'label': 'Skip to Service Worker', 'value': { 'page': '/skip/service-worker' }}">
                    {{ $t('generator.skip') }}
                  </button>
                </div>
              </div>
              <p class="l-narrow">{{ $t('generator.skip_description') }}</p>
              
            </form>
          </div>
        </div>
      </div>
    </div>
    <TwoWays/>
  </section>
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Action, State, namespace } from 'vuex-class';

import GeneratorMenu from '~/components/GeneratorMenu';
import TwoWays from '~/components/TwoWays';
import Loading from '~/components/Loading';

import * as generator from '~/store/modules/generator';

const GeneratorState = namespace(generator.name, State);
const GeneratorAction = namespace(generator.name, Action);

@Component({
  components: {
    TwoWays,
    GeneratorMenu,
    Loading
  }
})
export default class extends Vue {
  public url$: string | null = null;
  public generatorReady = true;

  @GeneratorState url: string;
  @GeneratorState error: string;

  @GeneratorAction updateLink;
  @GeneratorAction getManifestInformation;

  public created(): void {
    this.url$ = this.url;
  }

  public get inProgress(): boolean {
    return !this.generatorReady && !this.error;
  }

  public skipCheckUrl(): void {
    this.$router.push({
      name: 'serviceworker'
    });
  }

  public async checkUrlAndGenerate(): Promise<void> {
    this.generatorReady = false;
    this.updateLink(this.url$);
    if (this.url$) {
      this.url$ = this.url;
      await this.getManifestInformation();

      this.$router.push({
        name: 'generate'
      });
    }
  }
}
</script>
