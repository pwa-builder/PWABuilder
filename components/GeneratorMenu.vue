<template>
<section class="generator_menu">
  <h1 id="howItWorks">How it works...</h1>
  <ul class="generator_menu-tabs">
    <li class="generator_menu-tab">
      <nuxt-link :to="$i18n.path(firstLinkPath ? '' : 'generate')" exact class="generator_menu-link" :active-class="activeClass"
        data-step="1">
       <!--{{ $t('generatormenu.generate') }}-->
      </nuxt-link>

      <div id="circleText">
        <h4>Lorem ipsum so dolor</h4>
        <p>Lorem ipsum so dolor sit amet etc and a quick summary about what a PWA is. Also a link to more information</p>
      </div>
    </li>

    <li class="generator_menu-tab">
      <nuxt-link :to="$i18n.path('serviceworker')" class="generator_menu-link" :active-class="activeClass" data-step="2">
        <!--{{ $t('generatormenu.serviceworker') }}-->
      </nuxt-link>
      
      <div id="circleText">
        <h4>Lorem ipsum so dolor</h4>
        <p>Lorem ipsum so dolor sit amet etc and a quick summary about what a PWA is. Also a link to more information</p>
      </div>
    </li>

    <li class="generator_menu-tab">
      <nuxt-link :to="$i18n.path('publish')" class="generator_menu-link" :active-class="activeClass" data-step="3">
        <!--{{ $t('generatormenu.publish') }}-->
      </nuxt-link>

      <div id="circleText">
        <h4>Lorem ipsum so dolor</h4>
        <p>Lorem ipsum so dolor sit amet etc and a quick summary about what a PWA is. Also a link to more information</p>
      </div>
    </li>
    
    <li class="generator_menu-tab">
      <nuxt-link :to="$i18n.path('publish')" class="generator_menu-link" :active-class="activeClass" data-step="3">
        <!--{{ $t('generatormenu.publish') }}-->
      </nuxt-link>
      
      <div id="circleText">
        <h4>Lorem ipsum so dolor</h4>
        <p>Lorem ipsum so dolor sit amet etc and a quick summary about what a PWA is. Also a link to more information</p>
      </div>
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
    font-size: $font-size-l;
    margin-bottom: 4vw;
    padding: 1rem 0;
    text-align: center;
    width: 100%;
  }

  &-info {
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
    height: 184px;
    padding: 2rem;
    width: 184px;
  }

  #howItWorks {
    font-size: 32px;
    margin-bottom: 41px;
    margin-left: 68px;
    margin-top: 64px;
  }

  #circleText {
    width: 184px;
  }
}
</style>