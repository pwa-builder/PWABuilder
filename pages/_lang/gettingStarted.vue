
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
import axios from 'axios';
import Component from 'nuxt-class-component';
import { Action, State, namespace } from 'vuex-class';

import GoodPWA from '~/components/GoodPWA.vue';

/*import * as serviceworker from '~/store/modules/serviceworker';
import { ServiceWorker } from '~/store/modules/serviceworker';

const ServiceworkerState = namespace(serviceworker.name, State);
const ServiceworkerAction = namespace(serviceworker.name, Action);*/

const apiUrl = `${process.env.apiUrl}/serviceworkers/getServiceWorkerFromUrl?siteUrl`;

@Component({
  components: {
    GoodPWA
  }
})
export default class extends Vue {

  /*@ServiceworkerState serviceworkers: any[];

  @ServiceworkerAction getSiteServiceWorker;*/


  public async created(): Promise<void> {
    console.log('hello world');
    const data = await axios.get(`${apiUrl}=https://notes-b9f02.firebaseapp.com/`);
    console.log(data.data);
    // await this.analyzeWorker();
  }
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

