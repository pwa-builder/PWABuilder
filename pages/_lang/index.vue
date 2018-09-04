<template>
  <div id="wrapperDiv">
    <section class="indexSection">
      <div class="line"></div>
      <h2>How it Works</h2>
    </section>

    <section class="indexSection">
      <div class="line"></div>
      <h2>Other Useful Tools</h2>

      <div id="cardBar">
        <Card title="Windows APIs" description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sit amet.."/>
        <Card title="Image Generator" description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sit amet.."/>
        <Card title="Knowledge Base" description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sit amet.."/>
      </div>
    </section>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'nuxt-class-component';

import Card from '~/components/Card.vue';

@Component({
  components: {
    Card
  }
})
export default class extends Vue {
}
</script>

<style lang="scss" scoped>
  @import '~assets/scss/base/variables';

  h2 {
    color: #838383;
    height: 30px;
  }

  .indexSection {
    margin-left: 92px;
    margin-right: 92px;
  }

  .line {
    background: #D8D8D8;
    height: 2px;
    width: 100%;
  }

  #wrapperDiv {
    margin-top: 27px;
  }

  #cardBar {
    display: flex;
    justify-content: space-around;
  }

</style>
