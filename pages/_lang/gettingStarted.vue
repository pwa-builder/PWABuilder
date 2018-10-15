
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
      <GoodPWA :isHttps="true" :hasManifest="basicManifest" :hasBetterManifest="betterManifest" :allGoodWithText="true" />
    </div>
  </section>
</template>



<script lang='ts'>
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { State, namespace } from 'vuex-class';

import GoodPWA from '~/components/GoodPWA.vue';

import * as generator from '~/store/modules/generator';

const GeneratorState = namespace(generator.name, State);

@Component({
  components: {
    GoodPWA
  }
})
export default class extends Vue {
  
  public manifest$: generator.Manifest | null = null;
  public basicManifest = false;
  public betterManifest = false;
  public bestManifest = true;

  @GeneratorState manifest: generator.Manifest;

  public created() {
    console.log(this.manifest);
    this.analyzeManifest(this.manifest);
  }

  private analyzeManifest(manifest) {
    // set props to pass to GoodBetterBest component
    // based on how filled out the manifest is

    // we already know we have a manifest by this point
    this.basicManifest = true;

    // does the manifest have related applications filled out?
    if (manifest.icons && manifest.icons.length > 0) {
      this.betterManifest = true;
    }

    // if we have all the values filled out we have the
    // "best" manifest
    for (let key in manifest) {
      if (manifest.hasOwnProperty(key)) {
          if (manifest[key].length === 0) {
            // an entry is empty
            this.bestManifest = false;
          }
      }
    }
  }
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

