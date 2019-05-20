<template>
  <button
    :class="{'pwa-button--brand': isBrand, 'pwa-button--total_right': isRight}"
    @click="buildArchive(platform, parameters);  $awa( { 'referrerUri': 'https://www.pwabuilder.com/download/{platform}' });"
  >
    <span v-if="isReady">
      <i class="fas fa-long-arrow-alt-down"></i>
    </span>

    <div v-if="!isReady">
      <div class="flavor">
        <div class="colorbands"></div>
      </div>
      <div class="icon">
        <i class="fas fa-long-arrow-alt-down"></i>
      </div>
    </div

    <div id="errorDiv" v-if="errorMessage">{{ errorMessage }}</div>
  </button>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";
import Loading from "~/components/Loading.vue";
import { Prop } from "vue-property-decorator";
import { Action, State, namespace } from "vuex-class";

import * as publish from "~/store/modules/publish";

const PublishState = namespace(publish.name, State);
const PublishAction = namespace(publish.name, Action);

declare var awa: any;

Vue.prototype.$awa = function(config) {
  awa.ct.capturePageView(config);

  return;
};

@Component({
  components: {
    Loading
  }
})
export default class extends Vue {
  public isReady = true;
  public errorMessage = "";

  @Prop({ type: String, default: "" })
  public readonly platform: string;

  @Prop({
    type: Array,
    default: function() {
      return [];
    }
  })
  public readonly parameters: string[];

  @Prop({ type: Boolean, default: false })
  public readonly isBrand: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly isRight: boolean;

  @Prop({ type: String, default: "" })
  private readonly message: string;
  public message$ = "";

  @PublishState archiveLink: string;
  @PublishAction build;

  public created(): void {
    this.message$ = this.message;
  }

  public async buildArchive(
    platform: string,
    parameters: string[]
  ): Promise<void> {
    console.log("this.isReady", this.isReady);
    if (!this.isReady) {
      return;
    }

    try {
      this.isReady = false;

      await this.build({ platform: platform, options: parameters });

      if (this.archiveLink) {
        window.location.href = this.archiveLink;
      }

      // Because browser delay
      setTimeout(() => (this.isReady = true), 3000);
    } catch (e) {
      this.isReady = true;
      this.errorMessage = e;
      this.message$ = this.$t("publish.try_again") as string;
    }
  }
}
</script>


<style lang="scss" scoped>
#errorDiv {
  position: absolute;
  color: red;
  width: 15em;
  text-align: start;
  font-size: 14px;
  bottom: 24em;
  left: 5.4em;
}

.flavor {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 40px;
  overflow: hidden;
  left: -7px;
  top: -2px;
}

.flavor > .colorbands {
  position: relative;
  top: 0%;
  left: -20%;

  width: 140%;
  height: 800%;

  background-image: linear-gradient(
    0deg,
    #1fc2c8 25%,
    #9337d8 50%,
    #9337d8 75%,
    #1fc2c8 100%
  );
  background-position: 0px 0px;
  background-repeat: repeat-y;

  animation: colorbands 100s linear infinite;
  transform: rotate(180deg);
}

@keyframes colorbands {
  to {
    background-position: 0 -1000vh;
  }
}

.icon {
  position: relative;
  color: white;
  top: -27px;
}

@media (max-height: 890px) {
  #errorDiv {
    bottom: 10em;
  }
}
</style>
