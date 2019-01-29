<template>
  <section>
    <div class="modal" v-if="showModal">
      <div class="modal-box">
        <!-- <div class="pure-u-1-1 modal-tablec">
        <span class="l-generator-close" @click="onClickCancel()">
          <span class="icon-times"></span>
        </span>
        </div>-->
        <div class="modal-body">
          <div id="titleBox">
            <h5 class="modal-title modal-title--normal">{{title}}</h5>
          </div>

          <slot/>

          <div v-if="title != ''" class="modal-buttons">
            <button
              v-if="showSubmitButton"
              id="modalAddButton"
              @click="onClickSubmit();  $awa( { 'referrerUri': 'https://preview.pwabuilder.com/manifest/add-member' });"
            >
              {{$t("modal.submit")}}
              <Loading :active="isLoading" class="u-display-inline_block u-margin-left-sm"/>
            </button>

            <slot name="extraButton"></slot>

            <button
              id="modalCancelButton"
              @click="onClickCancel(); $awa( { 'referrerUri': 'https://preview.pwabuilder.com/manifest/add-member' });"
            >{{$t("modal.cancel")}}</button>
          </div>
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
    this.$emit("submit");
  }

  public onClickCancel(): void {
    this.hide();
    this.$emit("cancel");
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
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  overflow-y: auto;

  .modal-title {
    font-size: 36px;
    width: 50%;
    padding-left: 1em;
    margin: 0;
    margin-left: 0;
    padding-top: 1em;
  }

  .modal-body {
    margin-top: 4em;
  }

  .modal-buttons {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    background: white;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    height: 4em;

    #modalCancelButton {
      background: $color-brand-warning;
      color: white;
      font-size: 16px;
      font-weight: bold;
    }

    button {
      border: none;
      margin: 8px;
      border-radius: 20px;
      width: 97px;
      font-size: 12px;
      font-weight: bold;
      padding-top: 8px;
      padding-bottom: 8px;
    }
  }
}
</style>