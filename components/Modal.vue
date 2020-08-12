<template>
  <dialog :open="showModal">
    <div class="modal" v-if="showModal">
      <div class="modal-box">
        <button
          id="modalCloseButton"
          aria-label="Close"
          class="closeButtonDiv"
          @click="onClickCancel()"
        >
          <i class="fas fa-times"></i>
        </button>
        <div class="modal-body">
          <div v-if="showTitleBox" id="titleBox">
            <h5 class="modal-title modal-title--normal">{{title}}</h5>

            <slot name="extraP"></slot>

            <slot name="featureContentSlot"></slot>
          </div>

          <slot />

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
              <span v-if="!isLoading">{{button_name}}</span>
              <span vif="isLoading">
                <Loading :active="isLoading" class="u-display-inline_block u-margin-left-sm" />
              </span>
            </button>

            <slot name="extraButton"></slot>
          </div>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { Prop } from "vue-property-decorator";
import Component from "nuxt-class-component";
import Loading from "~/components/Loading.vue";

@Component({
  components: {
    Loading,
  },
})
export default class extends Vue {
  public showModal = false;
  private loadingCount = 0;

  @Prop({ type: String, default: "" }) public title: string;
  @Prop({ type: Boolean, default: true }) public showSubmitButton;
  @Prop({ type: Boolean, default: true }) public showTitleBox;
  @Prop({ type: String, default: "Submit" }) public button_name: string;
  //public showButtons: string;

  public updated() {
    console.log("updated");
    console.log(this.$el);

    console.log(this.$el.getElementsByClassName("closeButtonDiv")[0]);

    const closeButton = <HTMLElement>(
      this.$el.getElementsByClassName("closeButtonDiv")[0]
    );
    if (closeButton) {
      closeButton.focus();
    }
  }

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

<style lang="scss">
/* stylelint-disable */

@import "~assets/scss/base/variables";
.modal {
  position: fixed;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  z-index: 99999;
  overflow-y: auto;
  animation-name: opened;
  animation-duration: 250ms;
  border-radius: 4px;

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
    background: #3c3c3c;
    opacity: 0.8;
    z-index: 98999;
  }

  .closeButtonDiv {
    top: 10px;
    border: none;
    float: right;
    height: 32px;
    background: #3c3c3c;
    color: white;
    border-radius: 50%;
    width: 32px;
    margin-top: 10px;
    margin-right: 10px;
    right: 10px;
    position: absolute;
    font-size: 14px;

    .icon-times {
      font-size: 1.6em;
    }
  }

  .modal-body {
    display: flex;
    padding-left: 164px;

    width: 100%;
    display: flex;
    flex-direction: column;

    padding-left: 60px;
    padding-right: 60px;
  }

  /* On smaller screens, reduce the padding on modals */
  @media (max-width: $media-screen-m) {
    .modal-body {
      padding-left: 10px;
      padding-right: 10px;
    }
  }

  .modal-title {
    font-size: 32px;
    margin: 0;
    padding-top: 1em;
    margin-bottom: 30px;

    font-family: sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 25px;
    margin-top: 10px;
  }

  .modal-buttons {
    display: flex;
    align-items: center;
    justify-content: center;

    margin-top: 5em;
    margin-bottom: 4em;

    #modalCancelButton {
      margin-right: 10px;
      border: none;

      background: #3c3c3c;
      color: white;
      padding: 10px;
      font-size: 14px;
      border-radius: 20px;
      width: 150px;
      height: 40px;
      padding-left: 20px;
      padding-right: 20px;
      font-family: sans-serif;
      font-style: normal;
      font-weight: 600;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    button {
      border: none;
      background: #9337d8;
      color: white;
      padding: 10px;
      font-size: 14px;
      border-radius: 20px;
      width: 150px;
      height: 40px;
      padding-left: 20px;
      padding-right: 20px;
      font-family: sans-serif;
      font-style: normal;
      font-weight: 600;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .modal-box {
    background: white;
    width: 70%;
    border-radius: 12px;
  }

  #titleBox {
    padding-right: 100px;
  }
}
</style>