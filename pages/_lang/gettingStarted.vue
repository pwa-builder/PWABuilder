
<template>
  <section>
    <div class="mastHead">
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
      <GoodPWA :isHttps="true" :allGoodWithText="true" />
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

.mastHead {
  margin-bottom: 12em;
}

  .chooseContainer {
    margin-top: 118px;

    h2 {
      margin-left: 68px;
      margin-bottom: 28px;
    }
  }

</style>

