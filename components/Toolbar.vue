<template>
  <header>
    <div id="titleHeader">
      <img id="headerImage" alt="headerImage" />
      <h1>PWA Builder</h1>
    </div>

    <div id="buttonBlock">
      <button id="manifestButton">Manifest</button>
      <button id="helpButton">Help</button>
    </div>
  </header>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'nuxt-class-component';

@Component({})
export default class extends Vue {

}
</script>

<style lang="scss" scoped>
@import '~assets/scss/base/variables';

header {
  align-items: center;
  background: $color-brand;
  color: white;
  display: flex;
  height: 195px;
  justify-content: space-between;
  width: 100%;
}

#headerImage {
  background: white;
  height: 97px;
  margin-right: 15px;
  width: 93px;
}

#headerImageBlock {
  display: flex;
  justify-content: space-between;
  margin: 20px;
  z-index: 99;
}

#headerBlock {
  background: $color-secondary;
  color: $color-brand;
  display: flex;
  justify-content: space-between;
  margin-left: 83px;
  margin-right: 83px;
  margin-top: 8rem;
}

#titleHeader {
  display: flex;
  margin-left: 33px;
}

#manifestButton {
  background: $color-complementary;
  border: none;
  border-radius: 5px;
  box-shadow: 0 7px 9px 0 #002cff, 0 4px 0px 0 #002cff;
  height: 47px;
  margin-right: 25px;
  width: 92px;
}

#manifestBlock {
  z-index: 99;
}

#helpButton {
  background: transparent;
  border: none;
  color: white;
  margin-right: 89px;
}

h1 {
  font-size: 40px;
  font-weight: normal;
  margin: 0;
  width: 125px;
}
</style>