<template>
<section class="generator_menu">
    <header class="generator_menu-header">
        Generate your Progressive Web App
    </header>
    <p class="generator_menu-info">
      PWA.tools takes data from your site and uses that to generate cross-platform Progressive Web Apps
    </p>
    <ul class="generator_menu-tabs">
        <li class="ember-view generator_menu-tab active">
            <a class="generator_menu-tab_action">
                Generate Manifest
            </a>
        </li>
        <li class="ember-view generator_menu-tab">
            <a class="generator_menu-tab_action">
                Build Service Worker
            </a>
        </li>
        <li class="ember-view generator_menu-tab">
            <a class="generator_menu-tab_action">
                Publish PWA
            </a>
        </li>
    </ul>
</section>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'nuxt-class-component'

@Component()
export default class TwoWays extends Vue {
}
</script>

<style lang="scss" scoped>
@import '~assets/scss/base/variables';

.generator_menu {
}

</style>