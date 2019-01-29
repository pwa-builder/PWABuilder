<template>
<section v-if="active">
  <div class="lds-dual-ring"></div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue-property-decorator';
import Component from 'nuxt-class-component';

@Component({})
export default class extends Vue {
  @Prop({ type: Boolean, default: false })
  public active: boolean;
}
</script>

<style lang="scss" scoped>
/*stylelint-disable*/
@import "~assets/scss/base/variables";

// From: https://projects.lukehaas.me/css-loaders/
/*.loading {
  $size: 1.1em;

  animation: spin 1.3s linear infinite;
  border: solid .12em white;
  border-color: blue;
  border-radius: 50%;
  border-style: solid;
  border-width: .12em;
  height: $size;
  position: relative;
  top: .2em;
  width: $size;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
}*/

.lds-dual-ring {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
}

.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 1.1em;
  height: 1.1em;
  margin: 1px;
  border-radius: 50%;
  border: 5px solid #fff;
  border-color: #8148cd transparent #8148cd transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}

@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}


</style>