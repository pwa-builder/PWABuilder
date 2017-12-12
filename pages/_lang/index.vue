<template>
  <section>
    <GeneratorMenu/>
    <div class="l-generator-step">
      <div class="pure-g l-generator-padded">
        <div class="pure-u-1 pure-u-md-3-5 pure-u-lg-2-5">
          <header class="l-generator-header l-generator-header--minimal">
            <h2 class="l-generator-title">Provide a URL</h2>
            <h4 class="l-generator-subtitle">
              Provide your URL and we'll help fill in the gaps if there are any.
            </h4>
          </header>

          <div class="l-generator-form">
            <div class="l-generator-field">
              <label class="l-generator-label" for="siteUrl">URL</label>
              <input class="l-generator-input" placeholder="Enter a URL" name="siteUrl" id="siteUrl" type="url" ref="url" v-model="siteUrl">
            </div>

            <div class="pure-g l-breath">
              <div class="l-generator-wrapper pure-u-3-5">
                  <button 
                    @click="checkUrlAndGenerate"
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
            <p class="l-narrow">If you already have the Manifest and want to download the service worker source code you can skip the first step.</p>
          </div>
        </div>
      </div>
    </div>
    <TwoWays/>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

import { modules } from "~/store";
import GeneratorMenu from "~/components/GeneratorMenu";
import TwoWays from "~/components/TwoWays";
import Loading from "~/components/Loading";

const GeneratorState = namespace(modules.generator.name, State);
const GeneratorAction = namespace(modules.generator.name, Action);

@Component({
  components: {
    TwoWays,
    GeneratorMenu,
    Loading
  }
})
export default class extends Vue {
  public siteUrl: string | null = null;
  public generatorReady = true;

  @GeneratorState url: string;
  @GeneratorState error: string;

  @GeneratorAction updateLink;
  @GeneratorAction getManifestInformation;

  public mounted():void {
    this.siteUrl = '';
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
    this.updateLink(this.siteUrl);
    if (this.siteUrl) {
      this.siteUrl = this.url;
    }
    await this.getManifestInformation();
    this.$router.push({
      name: 'serviceworker'
    });
  }
}
</script>
