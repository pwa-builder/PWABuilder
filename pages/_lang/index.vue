<template>
  <div>
    <section>
      <h2>How it Works</h2>
    </section>

    <section>
      <h2>Other Useful Tools</h2>
    </section>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'nuxt-class-component';

@Component({})
export default class extends Vue {
}
</script>

<style lang="scss" scoped>
  @import '~assets/scss/base/variables';

  h2 {
    color: #838383;
    height: 30px;
  }

</style>
