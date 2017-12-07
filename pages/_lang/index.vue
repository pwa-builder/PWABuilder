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
                  <button @click="checkUrlAndGenerate"
                          data-flare="{'category': 'Build', 'action': 'Step 2', 'label': 'Scan for Manifest', 'value': { 'page': '/build/manifest-scan' }}" class="get-started pwa-button isEnabled next-step">
                          Get Started
                  </button>
              </div>

              <div class="pure-u-2-5">
                 <p class="l-generator-error">{{error}}</p>
              </div>

              <div class="l-generator-wrapper pure-u-1">
                <button class="pwa-button pwa-button--simple" data-flare="{'category': 'Skip', 'action': 'Manifest', 'label': 'Skip to Service Worker', 'value': { 'page': '/skip/service-worker' }}">
                        Skip to Build Service Worker
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

const GeneratorState = namespace(modules.generator.name, State);
const GeneratorAction = namespace(modules.generator.name, Action);

@Component({
  components: {
    TwoWays,
    GeneratorMenu
  }
})
export default class extends Vue {
  public siteUrl: string | null = null;

  @GeneratorState url: string;
  @GeneratorState error: string;

  @GeneratorAction updateLink;
  @GeneratorAction getManifestInformation;

  public async checkUrlAndGenerate(): Promise<void> {
    this.updateLink(this.siteUrl);
    this.siteUrl = this.url;

    await this.getManifestInformation();
    this.$router.push({
      name: 'serviceworker'
    });
  }
}
</script>
