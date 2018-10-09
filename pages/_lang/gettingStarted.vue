
<template>
  <section>
    <div class="resultsMastHead">
      <h2>Great!</h2>
      <h2>You're already on your way to creating a pwa!</h2>
      <p>
        <!--this will possibly have to be dynamic-->
        We've had a look over your site and it's looking good. 
        You've already got a manifest, which forms the base of a PWA,
        but we highly recommend you add some features like 
        Service Workers to make the experience even better for your users.
      </p>
    </div>

    <div class="chooseContainer">
      <h2>Your App Results</h2>
      <GoodPWA :allGoodWithText="true" />
    </div>
  </section>
</template>



<script lang='ts'>
import Vue from 'vue';
import Component from 'nuxt-class-component';

import GoodPWA from '~/components/GoodPWA.vue';

@Component({
  components: {
    GoodPWA
  }
})
export default class extends Vue {
  
}
</script>

<style lang="scss" scoped>
  /* stylelint-disable */
  @import '~assets/scss/base/variables';

  .chooseContainer {
    margin-top: 180px;

    h2 {
      margin-left: 68px;
      margin-bottom: 68px;
    }
  }
  .resultsMastHead {
    margin-top: 100px;
    color: $color-brand-quintary;
    width: 568px;
    margin-left: 68px;

    h2 {
      margin: 42px 0;
      font-size: 36px;
      line-height: 42px;
    }

    p {
      font-size: 22px;
      line-height: 32px;
      width: 472px;
    }

  }
</style>

