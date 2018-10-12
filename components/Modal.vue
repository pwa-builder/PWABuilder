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
          <a class="cancelText" href="#" @click="onClickCancel(); $awa( { 'referrerUri': 'https://preview.pwabuilder.com/manifest/add-member' });">
            {{$t("modal.cancel")}}
          </a>
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
  public pageDoc = <HTMLElement>document.querySelector('.mainDiv');

  @Prop({ type: String, default: '' })
  public title: string;

  public get isLoading() {
    return this.loadingCount > 0;
  }

  public show(): void {
    this.showModal = true;
    if(this.pageDoc && this.pageDoc.style){
      console.log(this.pageDoc)
      this.pageDoc.style.filter = 'blur(25px)';
    }
  }

  public hide(): void {
    this.showModal = false;
    
    this.pageDoc.style.filter = 'blur(0px)';

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
/* stylelint-disable */

@import "~assets/scss/base/variables";
.mainDiv {
  filter: blur(30px);
}
.modal {
  align-items: flex-start;
  background: rgba($color-brand-quartary, .25);
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  overflow-y: scroll;
  padding: 32px 0;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 100;

  &-box {
    filter: blur(0px);
    position: absolute;
    width: 100%;
    margin-top: 300px;
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
    text-align: center;
    width: 100%;
  }
}
</style>