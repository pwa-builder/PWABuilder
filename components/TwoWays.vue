<template>
<section class="twoways l-pad">
  <div class="pure-g">
    <div class="pure-u-1">
      <h2 class="l-generator-title">{{ $t('twoways.title') }}</h2>
    </div>

    <div class="pure-u-1 pure-u-md-1-2">
      <div class="pwa-infobox-box">
        <img class="pwa-infobox-logo" src="~/assets/images/logo_small.png" alt="Small PWA Builder logo">
        <h4 class="pwa-infobox-subtitle">{{ $t('twoways.web_based') }}</h4>
        <nuxt-link to="/" class="pwa-infobox-action" @click=" $awa( { 'referrerUri': 'https://preview.pwabuilder.com/manifest/' }); ">
          {{ $t('twoways.started_now') }}
        </nuxt-link>
      </div>
    </div>

    <div class="pure-u-1 pure-u-md-1-2">
      <div class="pwa-infobox-box">
        <img class="pwa-infobox-logo" src="~/assets/images/logo_small.png" alt="Small PWA Builder logo">
        <h4 class="pwa-infobox-subtitle">{{ $t('twoways.subtitle') }}</h4>
        <a class="pwa-infobox-action" href="https://github.com/pwa-builder/ManifoldJS/releases" target="_blank" @click=" $awa( { 'referrerUri': 'https://preview.pwabuilder.com/manifest/' });">
          {{ $t('twoways.download') }}
        </a>
      </div>
    </div>
  </div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';

@Component({})
export default class extends Vue {}
</script>