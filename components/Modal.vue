<template>
  <section>
    <div class="modal" v-if="showModal">
      <div class="modal-box">
        <div class="closeButtonDiv">
        <span class="l-generator-close" @click="onClickCancel()">
          <span class="icon-times"></span>
        </span>
        </div>
        <div class="modal-body">
          <div id="titleBox">
            <h5 class="modal-title modal-title--normal">{{title}}</h5>

            <slot name="extraP"></slot>

            <div v-if="title != ''" class="modal-buttons">
              <button
                id="modalCancelButton"
                @click="onClickCancel(); $awa( { 'referrerUri': 'https://www.pwabuilder.com/manifest/add-member' });"
              >{{$t("modal.cancel")}}</button>

              <button
                v-if="showSubmitButton"
                id="modalAddButton"
                @click="onClickSubmit();  $awa( { 'referrerUri': 'https://www.pwabuilder.com/manifest/add-member' });"
              >
                {{$t("modal.submit")}}
                <Loading :active="isLoading" class="u-display-inline_block u-margin-left-sm"/>
              </button>

              <slot name="extraButton"></slot>
            </div>

            <slot name="featureContentSlot"></slot>
          </div>

          <slot/>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import { Prop } from "vue-property-decorator";
import Component from "nuxt-class-component";
import Loading from "~/components/Loading.vue";

@Component({
  components: {
    Loading
  }
})
export default class extends Vue {
  public showModal = false;
  private loadingCount = 0;

  @Prop({ type: String, default: "" }) public title: string;
  @Prop({ type: Boolean, default: true }) public showSubmitButton;
  //public showButtons: string;

  public beforeDestroy() {
    // Set scrolling to normal here too just to avoid
    // scrolling potentially getting stuck off
    //(this.$root.$el.closest('body') as HTMLBodyElement).style.overflowY = 'scroll';
  }

  public get isLoading() {
    return this.loadingCount > 0;
  }

  public async show(): Promise<void> {
    // stop scrolling on the body when the modal is open
    // (this.$root.$el.closest('body') as HTMLBodyElement).style.overflowY = 'hidden';
    console.log("set style to hidden");

    this.showModal = true;
    // have to put a setTimeout here because Edge
    // has a bug with the filter css style
    setTimeout(() => {
      this.$emit("modalOpened");
    }, 200);
  }

  public hide(): void {
    // enable scrolling on the body when the modal is closed
    //(this.$root.$el.closest('body') as HTMLBodyElement).style.overflowY = 'scroll';

    this.showModal = false;
    this.$emit("modalClosed");
  }

  public onClickSubmit(): void {
    this.$emit("modalSubmit");
  }

  public onClickCancel(): void {
    this.$emit("cancel");
    this.hide();
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
.modal {

  /*align-items: flex-start;
  xbackground: rgba($color-brand-quartary, .25);
  display: flex;
   xheight: 150%; /*this is a hack, we should put modal at lower level */
  /*justify-content: center;
  left: 0;
  padding: 32px 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 100;
  xbottom: 0;

  &-box {
    filter: blur(0px);
    position: relative;
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
  }*/

  background: white;
  position: fixed;
  top: 5em;
  right: 5em;
  bottom: 5em;
  left: 5em;
  z-index: 99999;
  overflow-y: auto;
  animation-name: opened;
  animation-duration: 250ms;

  will-change: opacity transform;

  @keyframes opened {
    from {
      transform: scale(0.4, 0.4);
      opacity: 0.4;
    }

    to {
      transform: scale(1, 1);
      opacity: 1;
    }
  }

  .modalBackground {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: grey;
    opacity: 0.8;
    z-index: 98999;
  }

  .closeButtonDiv {
    position: absolute;
    top: 16px;
    left: 16px;

    .icon-times {
      font-size: 1.6em;
    }
  }

  .modal-body {
    display: flex;
  }

  .modal-title {
    font-size: 32px;
    margin: 0;
    margin-left: 0;
    padding-top: 1em;
    margin-bottom: 30px;
  }

  .modal-buttons {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    #modalCancelButton {
      background: $color-brand-secondary;
      color: white;
      font-size: 18px;
      font-weight: bold;
      margin-right: 10px;
    }

    button {
      background: $color-button-primary-purple-variant;
      color: white;
      border: none;
      border-radius: 20px;
      width: 130px;
      height: 44px;
      font-size: 18px;
      font-weight: bold;
      padding-top: 8px;
      padding-bottom: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  #titleBox {
    padding-left: 164px;
    padding-right: 100px;
    width: 50%;
  }
}
</style>