<template>
  <section>
    <GeneratorMenu/>
    {{ $t('publish.title') }}
    <TwoWays/>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Action, State, namespace } from 'vuex-class';

import { modules } from '~/store';
import GeneratorMenu from '~/components/GeneratorMenu';
import TwoWays from '~/components/TwoWays';

@Component({
  components: {
    TwoWays,
    GeneratorMenu
  }
})
export default class extends Vue {}
</script>
