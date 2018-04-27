<template>
  <section class="tiles">
    <div v-bind:controls="controls" v-for="item in controls" :key="item.id" class="card" v-on:click="focus(item, $event)">
      <div class="cardinside">
        <div class="thumbnail">
          <img :src=item.image />
        </div>
          <h1 class="title">{{ item.title }}</h1>
          <p class="description">{{ item.description }}</p>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Prop } from 'vue-property-decorator';

@Component()
export default class extends Vue {
  @Prop({})
  controls: any;
}
</script>

<style>
/* $base-background: #00CC99; */

</style>