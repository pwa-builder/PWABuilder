<template>
<section class="">
  <header class="generator_menu-header">
    {{ $t('windowsmenu.title') }}
  </header>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Prop } from 'vue-property-decorator';

@Component()
export default class extends Vue {
  public readonly activeClass = 'is-active';

  @Prop({ type: Boolean, default: false })
  public readonly firstLinkPath: boolean;
}
</script>

<style lang="scss" scoped>
@import "~assets/scss/base/variables";

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
    margin: 0 auto;
    padding: 0;
    text-align: center;
  }

  &-tab {
    display: inline-block;

    @media screen and (max-width: $media-screen-m) {
      display: block;
      margin: 2rem auto;
    }
  }

  &-link {
    background-color: $tab-color-off;
    color: $color-foreground-darker;
    cursor: pointer;
    display: inline-block;
    font-family: Bitter;
    font-size: $font-size-m;
    height: $tab-height;
    line-height: $font-size-m;
    margin: 0 3rem;
    padding: 2rem 1rem 2rem 3rem;
    position: relative;
    text-align: left;
    transition: all $animation-speed-default $animation-ease-default;
    width: $tab-size;

    &::after {
      border-bottom: $tab-height / 2 solid transparent;
      border-left: $tab-height / 2 solid $tab-color-off;
      border-top: $tab-height / 2 solid transparent;
      content: '';
      height: 0;
      position: absolute;
      right: - $tab-height / 2;
      top: 0;
      transition: all $animation-speed-default $animation-ease-default;
      width: 0;
    }

    &::before {
      $font: $tab-height * .4;
      $border: .5rem;

      background-color: $color-background-brighter;
      border: $border solid $tab-color-off;
      border-radius: 50%;
      box-shadow: inset 0 0 0 .2rem $color-brand;
      content: attr(data-step);
      font-size: $font;
      height: $tab-height;
      left: - $tab-height / 2;
      line-height: 2 * $font;
      position: absolute;
      text-align: center;
      top: 0;
      transition: all $animation-speed-default $animation-ease-default;
      width: $tab-height;
    }

    &.is-active {
      background-color: $tab-color-on;
      transition: all $animation-speed-default $animation-ease-default;

      &::after {
        border-left-color: $tab-color-on;
        transition: all $animation-speed-default $animation-ease-default;
      }

      &::before {
        border-color: $tab-color-on;
        box-shadow: none;
        transition: all $animation-speed-default $animation-ease-default;
      }
    }

    &:hover {
      width: $tab-size * 1.2;
    }

    @media screen and (max-width: $media-screen-m) {
      border-radius: .5rem;

      &::after {
        border: none;
      }
    }
  }
}
</style>