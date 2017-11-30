<template>
<section class="twoways l-pad">
  <div class="pure-g">
    <div class="pure-u-1">
      <h2 class="twoways-title">Two Ways to Work</h2>
    </div>

    <div class="pure-u-1 pure-u-md-1-2">
      <div class="twoways-box">
        <img class="twoways-logo" src="~/assets/images/logo_small.png" alt="Small PWA Builder logo">
        <h4 class="twoways-subtitle">Web Based</h4> 
        <nuxt-link to="/" class="twoways-action"
           data-flare='{"category": "Build", "action": "Step 1", "label": "PWA Infobox", "value": { "page": "/" }}'>
          Get started Now
        </nuxt-link>
      </div>
    </div>

    <div class="pure-u-1 pure-u-md-1-2">
      <div class="twoways-box">
        <img class="twoways-logo" src="~/assets/images/logo_small.png" alt="Small PWA Builder logo">
        <h4 class="twoways-subtitle">CLI (node based): v1.1.0 </h4> 
        <a class="twoways-action" href="https://github.com/pwa-builder/ManifoldJS/releases" target="_blank"
           data-flare='{"category": "Download", "action": "CLI", "label": "PWA Infobox", "value": { "page": "/" }}'>
          Download now
        </a>
      </div>
    </div>
  </div>
</section>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'nuxt-class-component'

@Component()
export default class TwoWays extends Vue {
}
</script>

<style lang="scss">
@import '~assets/scss/base/variables';
@import '~assets/scss/mixins/action';
.twoways {
    background-color: $color-background-dark;

    &--transparent {
        background-color: transparent;
    }

    &-title {
        font-family: 'Bitter';
        font-size: $font-size-xl;
        font-weight: $font-weight-regular;
        padding-bottom: $font-size-xl / 2;

        &--centered {
            text-align: center;
        }
    }

    &-subtitle {
        font-family: 'Bitter';
        font-size: $font-size-l;
        font-weight: $font-weight-bold;
        margin: .5rem 0 0 0;

        &--thin {
            font-weight: $font-weight-regular;
            margin-bottom: .5rem;
        }
    }

    &-box {
        background-color: $color-background-brighter;
        border-radius: .5rem;
        box-shadow: 0 .8rem 2rem .2rem rgba($color-background-darkest, .2);
        margin: .5vw .75vw;
        padding: 2.5rem;

        @media screen and (max-width: $media-screen-s) {
            margin-bottom: 2vw;
        }

        &--flat {
            box-shadow: none;
            min-height: 25rem;
            text-align: center;

            @media screen and (max-width: $media-screen-m) {
                min-height: 28rem;
            }

            @media screen and (max-width: $media-screen-s) {
                min-height: auto;
            }
        }
    }

    &-logo {
        max-width: 4.8rem;
        width: 100%;
    }

    &-action {
        @include action-link ( $color-complementary-bright, $color-complementary, .2rem, false);

        font-family: 'Bitter';
        font-size: $font-size-l;
        font-weight: $font-weight-regular;
    }

    &-padded {
        padding-bottom: 2rem;
    }
}

</style>