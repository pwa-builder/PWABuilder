<template>
<div
    :class="{'pwa-button--brand': isBrand, 'pwa-button--total_right': isRight}"
    @click="buildArchive(platform, parameters);  $awa( { 'referrerUri': 'https://www.pwabuilder.com/download/{platform}' });">

  <span v-if="isReady">{{ message$ }}</span>
  <span v-if="!isReady">
    <Loading :active="true" class="u-display-inline_block u-margin-left-sm" />
  </span>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';
import Loading from '~/components/Loading.vue';
import { Prop } from 'vue-property-decorator';
import { Action, State, namespace } from 'vuex-class';

import * as publish from '~/store/modules/publish';

const PublishState = namespace(publish.name, State);
const PublishAction = namespace(publish.name, Action);

declare var awa: any;

Vue.prototype.$awa = function (config) { 
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

  @Prop({ type: String, default: '' })
  public readonly platform: string;

  @Prop({ type: Array, default: function () { return []; }})
  public readonly parameters: string[];

  @Prop({ type: Boolean, default: false })
  public readonly isBrand: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly isRight: boolean;

  @Prop({ type: String, default: '' })
  private readonly message: string;
  public message$ = '';

  @PublishState archiveLink: string;
  @PublishAction build;

  public created(): void {
    this.message$ = this.message;
  }

  public async buildArchive(platform: string, parameters: string[]): Promise<void> {
    if (!this.isReady) {
      return;
    }

    this.isReady = false;

    try {
      await this.build({platform: platform, options: parameters});
      if (this.archiveLink) {
        window.location.href = this.archiveLink;
      }

      // Because browser delay
      setTimeout(() => this.isReady = true, 3000);
    } catch (e) {
      this.message$ = this.$t('publish.try_again') as string;
    }
  }
}
</script>
