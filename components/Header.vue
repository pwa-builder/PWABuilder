<template>
  <div class="headerWrapper">
    <header>
      <div id="headerImageBlock">
        <div id="titleHeader">
          <img id="headerImage" alt="headerImage" />
          <h1>PWA Builder</h1>
        </div>

        <div id="manifestBlock">
          <button id="manifestButton">Manifest</button>
          <button id="helpButton">Help</button>
        </div>
      </div>

      <section id="headerBlock">

        <div id="leftHeaderBlock">
          <h2 id="quickBlockText">Quickly and easily turn your website into a PWA</h2>

          <p id="quickBlockPlaceholder">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been.</p>

          <button id="learnMoreButton">Learn More</button>
        </div>

        <div id="rightHeaderBlock">
          <h2 id="getStartedHere">Get Started Here!</h2>

          <p id='placeholderText'>Enter your URL and we'll help you fill in the gaps if there are any.</p>

          <input id="getStartedInput" type="text" />

          <button id="getStartedButton">Get Started</button>
        </div>
      </section>
    </header>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'nuxt-class-component';

@Component({})
export default class extends Vue {

}
</script>

<style lang="scss" scoped>
  @import '~assets/scss/base/variables';

  .headerWrapper {
    background: $color-secondary;
    display: flex;
    height: 771px;
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
  }

  header {
    background: $color-secondary;
    color: $color-brand;
    width: 100%;
  }

  #headerBlock {
    background: $color-secondary;
    color: $color-brand;
    display: flex;
    justify-content: space-around;
    margin-left: 3rem;
    margin-top: 8rem;
  }

  #getStartedBlock {
    background: $color-brand;
    color: white;
    flex-grow: 1;
  }

  #quickBlockPlaceholder {
    color: #6A6A6A;
    font-size: 16px;
    width: 417px;
  }

  #quickBlockText {
    font-size: 36px;
    font-weight: normal;
    width: 439px;
  }

  h1 {
    font-size: 40px;
    font-weight: normal;
    margin: 0;
    width: 125px;
  }

  h2 {
    font-weight: normal;
  }

  #learnMoreButton {
    background: white;
    border: none;
    color: $color-brand;
    font-size: 20px;
    height: 48px;
    margin-top: 58px;
    width: 149px;
  }

  #getStartedButton {
    background: white;
    border: none;
    color: black;
    float: right;
    font-size: 20px;
    height: 48px;
    margin-top: 58px;
    width: 149px;
  }

  #getStartedInput {
    background: transparent;
    border: 1px solid white;
    border-radius: 5px;
    color: #6A6A6A;
    display: block;
    height: 71px;
    width: 491px;
  }

  #placeholderText {
    width: 297px;
  }

  #titleHeader {
    display: flex;
    margin-left: 33px;
  }

  #manifestButton {
    background: $color-complementary;
    border: none;
    border-radius: 5px;
    height: 47px;
    margin-right: 25px;
    width: 92px;
  }

  #helpButton {
    margin-right: 89px;
  }
</style>