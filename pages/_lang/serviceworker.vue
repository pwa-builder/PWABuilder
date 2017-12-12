<template>
  <section>
    <GeneratorMenu/>
      <div class="l-generator-step">
        <div class="l-generator-semipadded pure-g">
          <div class="pure-u-1 pure-u-md-1-2 generator-section service-workers">
            <div class="l-generator-subtitle">{{ $t('serviceworker.title') }}</div>
            <form @submit.prevent="build" @keydown.enter.prevent="build">
              <div class="l-generator-field l-generator-field--padded checkbox">
                <label class="l-generator-label">
                  <input type="radio" value="1">
                  Offline page
                </label>

                <span class="l-generator-description">This simple but elegant solution pulls a file from your web server called "offline.html" (make sure that file is actually there) and serves the file whenever a network connection can not be made.</span>
              </div>

              <button data-flare="{'category': 'Download', 'action': 'Web', 'label': 'Download Archive', 'value': { 'page': '/download/web' }}" class="pwa-button pwa-button--simple isEnabled">
                <span v-if="!isBuilding">{{ $t('serviceworker.download') }}</span>
                <span v-if="isBuilding">{{ $t('serviceworker.building') }} <Loading :active="true" :size="'sm'" class="u-display-inline_block u-margin-left-sm" /></span>
              </button>
            </form>
          </div>
          <div class="pure-u-1 pure-u-md-1-2 generator-section manifest manifest-holder">
            
          </div>
        </div>
      </div>
    <TwoWays/>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'nuxt-class-component'
import GeneratorMenu from '~/components/GeneratorMenu'
import TwoWays from '~/components/TwoWays'
import Loading from '~/components/Loading'

@Component({
  components: {
    TwoWays,
    GeneratorMenu,
    Loading
  }
})
export default class extends Vue {
  public isBuilding = false;

  public build(): void {
    this.isBuilding = true;
  }
}
</script>
