<template>
<section class="generator_menu">
  <header class="generator_menu-header">
    {{ $t('generatormenu.title') }}
  </header>
  <p class="generator_menu-info">
    {{ $t('generatormenu.subtitle') }}
  </p>

  <ul class="generator_menu-tabs">
    <li class="generator_menu-tab">
      <nuxt-link :to="$i18n.path(firstLinkPath ? '' : 'generate')" exact class="generator_menu-link" :active-class="activeClass"
        data-step="1">
       <!-- {{ $t('generatormenu.generate') }}-->
      </nuxt-link>
    </li>

    <li class="generator_menu-tab">
      <nuxt-link :to="$i18n.path('serviceworker')" class="generator_menu-link" :active-class="activeClass" data-step="2">
        <!--{{ $t('generatormenu.serviceworker') }}-->
      </nuxt-link>
    </li>

    <li class="generator_menu-tab">
      <nuxt-link :to="$i18n.path('publish')" class="generator_menu-link" :active-class="activeClass" data-step="3">
        <!--{{ $t('generatormenu.publish') }}-->
      </nuxt-link>
    </li>
    
    <li class="generator_menu-tab">
      <nuxt-link :to="$i18n.path('publish')" class="generator_menu-link" :active-class="activeClass" data-step="3">
        <!--{{ $t('generatormenu.publish') }}-->
      </nuxt-link>
    </li>
  </ul>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Prop } from 'vue-property-decorator';

@Component({})
export default class extends Vue {
  public readonly activeClass = 'is-active';

  @Prop({ type: Boolean, default: false })
  public readonly firstLinkPath: boolean;
}
</script>

<style lang='scss' scoped>
@import '~assets/scss/base/variables';

.generator_menu {
  $tab-color-off: $color-brand-brighter;
  $tab-color-on: $color-brand;
  $tab-size: 16rem;
  $tab-height: 5rem;

  background-color: $color-background-brighter;
  padding-bottom: 4rem;

  &-header {
    background-color: $color-brand;
    color: $color-foreground-darker;
    font-family: Bitter;
    font-size: $font-size-l;
    margin-bottom: 4vw;
    padding: 1rem 0;
    text-align: center;
    width: 100%;
  }

  &-info {
    font-family: Bitter;
    font-size: $font-size-m;
    margin: 2rem auto;
    text-align: center;
    width: 100%;

    @media screen and (max-width: $media-screen-m) {
      width: 90%;
    }
  }

  &-tabs {
    display: flex;
    justify-content: space-around;
  }

  &-tab {
    display: inline-block;

    @media screen and (max-width: $media-screen-m) {
      display: block;
      margin: 2rem auto;
    }
  }

  &-link {
    background: lightgrey;
    border-radius: 50%;
    display: block;
    padding: 2rem;
  }
}
</style>