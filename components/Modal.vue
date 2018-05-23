<template>
<section>
  <div class="modal" v-if="showModal">
    <div class="modal-box">
      <div class="pure-u-1-1 modal-tablec">
        <span class="l-generator-close" @click="onClickCancel()">
          <span class="icon-times"></span>
        </span>
      </div>

      <h5 class="modal-title modal-title--normal">
        {{title}}
      </h5>

      <div class="modal-body">
        <slot/>

        <div class="modal-buttons">
          <button class="l-generator-space_right pwa-button pwa-button--simple pwa-button--brand" @click="onClickSubmit();  $awa( { 'referrerUri': 'https://preview.pwabuilder.com/manifest/add-member' });">
            {{$t("modal.submit")}}
            <Loading :active="isLoading" class="u-display-inline_block u-margin-left-sm" />
          </button>
          <button class="pwa-button pwa-button--simple" @click="onClickCancel(); $awa( { 'referrerUri': 'https://preview.pwabuilder.com/manifest/add-member' });">
            {{$t("modal.cancel")}}
          </button>
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { Prop } from 'vue-property-decorator';
import Component from 'nuxt-class-component';
import Loading from '~/components/Loading.vue';

@Component({
  components: {
    Loading
  }
})
export default class extends Vue {
  public showModal = false;
  private loadingCount = 0;

  @Prop({ type: String, default: '' })
  public title: string;

  public get isLoading() {
    return this.loadingCount > 0;
  }

  public show(): void {
    this.showModal = true;
  }

  public hide(): void {
    this.showModal = false;
  }

  public onClickSubmit(): void {
    this.$emit('submit');
  }

  public onClickCancel(): void {
    this.hide();
    this.$emit('cancel');
  }

  public showLoading(): void {
    this.loadingCount++;
  }

  public hideLoading(): void {
    this.loadingCount--;

    if (this.loadingCount < 0) {
      this.loadingCount = 0;
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~assets/scss/base/variables";

.modal {
  align-items: flex-start;
  background: rgba($color-background-darkest, .3);
  display: flex;
  height: 100vh;
  justify-content: center;
  left: 0;
  overflow-y: scroll;
  padding: 32px 0;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 100;

  &-box {
    $w: 60vw;

    background: $color-background-brighter;
    border-radius: .5rem;
    box-shadow: 0 4px 25px 4px rgba(0, 0, 0, .3);
    box-sizing: border-box;
    position: relative;
    width: $w;
    z-index: 110;

    &.error {
      max-height: 480px;
      min-height: 320px;

      @media screen and (max-width: $media-screen-l) {
        min-height: 320px;
      }

      @media screen and (max-width: $media-screen-m) {
        min-height: 320px;
      }

      .pwa-generator-box_buttons {
        margin-top: 25px;
      }
    }

    @media screen and (max-width: $media-screen-l) {
      $w: 60vw;

      width: $w;
    }

    @media screen and (max-width: $media-screen-m) {
      $w: 80vw;

      width: $w;
    }
  }

  &-title {
    font-family: Bitter;
    font-size: $font-size-l;
    font-weight: $font-weight-semibold;
    margin-top: 0;
    text-align: center;
    width: 100%;
  }

  &-body {
    margin: 45px auto 0 auto;
    padding: 18px;
    width: 60%;
  }

  &-tablec {
    $padding: 1.5rem;

    font-family: Bitter;
    font-size: $font-size-m;
    padding-right: $padding;
    padding-top: $padding;
    text-align: right;
    text-transform: capitalize;

    img {
      max-width: 90%;
    }
  }

  &-buttons {
    text-align: right;
  }
}
</style>