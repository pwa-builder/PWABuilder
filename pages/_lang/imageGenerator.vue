<template>
  <section>
    <div class="pwa-generator">
      <header class="pwa-generator-header">
          App Image Generator
      </header>

      <p class="pwa-generator-info"> Quickly and easily create app icons for various platforms in the right size and format </p>

      <div class="pwa-generator-step active">
        <form id="imageFileInputForm" enctype="multipart/form-data" role="form" ref="form">
          <div class="pwa-generator-padded pure-g">
            <div class="pwa-generator-form pure-u-1 pure-u-md-1-2">
              <h4 class="pwa-generator-subtitle">
                Image Details 
              </h4>
              <h4 class="pwa-generator-subtitle pwa-generator-subtitle--last">
                Specify the image details below.
              </h4>
              <div class="pwa-generator-field">
                  <span class="pwa-generator-label">Input Image</span>
                  <label class="pwa-generator-input pwa-generator-input--fake is-disabled" id="fileNameLabel" for="fileName"
                  ref=fileNameLabel>
                      {{labelFileName}}
                  </label>
                  <input id="fileName" name="fileName" class="l-hidden" type="file" ref="fileName" @change="changeLabel" />
              </div>
              <div class="pwa-generator-field">
                <label class="pwa-generator-label">Padding</label>
                <input class="pwa-generator-input pwa-generator-input--hassmall" name="padding" type="number" value="0.3" min="0" step="any" />
                <small class="pwa-generator-small">0 is no padding, 1 is 100% of the source image. 0.3 is a typical value for most icons</small>
              </div>
              <div class="pwa-generator-field">
                <label class="pwa-generator-label">Background Color</label>
                <div class="pwa-generator-options">
                  <label class="pwa-generator-label">
                    <input type="radio" name="colorOption" class="colorOption" checked="checked" value="0" />
                    Transparent
                  </label>
                  <label class="pwa-generator-label">
                    <input type="radio" name="colorOption" class="colorOption" value="1" />
                    Custom color
                  </label>  
                  <div class="colorpickers">
                    <input class="pwa-generator-input pwa-generator-input--tiny input-color" type="color" />
                    <input class="pwa-generator-input pwa-generator-input--small pwa-generator-input--hassmall" placeholder="#000000" name="color" id="color" type="text" />
                    <input type="hidden" name="colorChanged" id="colorChanged" value="0" />
                    <small class="pwa-generator-small">Choose a color for the background (leave blank to default to the pixel at the top left)</small>
                  </div>
                </div>
              </div>
            </div>
            <div class="pwa-generator-form pure-u-1 pure-u-md-1-2">
              <h4 class="pwa-generator-subtitle">
                  Platforms
              </h4>
              <h4 class="pwa-generator-subtitle pwa-generator-subtitle--last">
                <p>Select the platforms to generate images for.</p>
                <p>(*) windows platform generates images for Windows 8.1 and Windows Phone 8.1 apps.</p>
              </h4>
              <div class="pwa-generator-field">
                <div class="pure-g" ref="checkPlatforms">
                  <div class="pure-u-1 pure-u-md-1-2">
                    <label class="pwa-generator-label pwa-generator-label--check">
                      <input type="checkbox" name="platform" value="windows10" v-model="platforms">
                      windows10
                    </label>
                  </div>
                  <div class="pure-u-1 pure-u-md-1-2">
                    <label class="pwa-generator-label pwa-generator-label--check">
                      <input type="checkbox" name="platform" value="windows" v-model="platforms">
                      windows *
                    </label>
                  </div>
                  <div class="pure-u-1 pure-u-md-1-2">
                    <label class="pwa-generator-label pwa-generator-label--check">
                      <input type="checkbox" name="platform" value="android" 
                        v-model="platforms">
                      android
                    </label>
                  </div>
                  <div class="pure-u-1 pure-u-md-1-2">
                    <label class="pwa-generator-label pwa-generator-label--check">
                      <input type="checkbox" name="platform" value="ios" v-model="platforms">
                      ios
                    </label>
                  </div>
                  <div class="pure-u-1 pure-u-md-1-2">
                    <label class="pwa-generator-label pwa-generator-label--check">
                      <input type="checkbox" name="platform" value="chrome" v-model="platforms">
                      chrome
                    </label>
                  </div>
                  <div class="pure-u-1 pure-u-md-1-2">
                    <label class="pwa-generator-label pwa-generator-label--check">
                      <input type="checkbox" name="platform" value="firefox" v-model="platforms">
                      firefox
                    </label>
                  </div>
                  <div class="pure-u-1 pure-u-md-1-2">
                    <button id="selectPlatforms" @click.prevent="checkAll" class="pwa-button pwa-button--simple">
                      Select/Clear All
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="pure-u-1 u-center" >
                <button class="pwa-button" id="downloadButton" ref="downloadButton" v-on:click.prevent="useAPI" 
                :disabled='disableDownload'> Download 
                <span v-if="isLoading"><i class="fa fa-circle-notch fa-spin" aria-hidden="true"></i></span></button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script lang='ts'>
import axios from 'axios';
import GeneratorMenu from '~/components/GeneratorMenu.vue';

 
export default {
  components: {GeneratorMenu},

  data() {
    return {
      titulo: 'App Image Generator',
      labelFileName: 'Choose File',
      isLoading: false,
      isAllChecked: true,
      platforms: ['windows10', 'windows', 'android', 'ios', 'chrome', 'firefox'], 
    };
  },

  methods: {
    useAPI() {
      this.isLoading = true;
      
      const urlUseAPI = process.env.apiUrl2 + '/';
      const formData = new FormData(this.$refs.form);
      
      axios.post(urlUseAPI + 'api/image', formData)
      .then(result => {
        const fileUri = result.data.Uri;
        console.log('Response from Api');
        window.open(urlUseAPI + fileUri.substring(1), '_blank');
        this.isLoading = false;
      });
    },
    changeLabel() {
        this.labelFileName = this.$refs.fileName.files[0].name;
    },
    checkAll() {
        if (this.isAllChecked) {
          this.platforms = [];
          this.isAllChecked = false;
        } else {
          this.platforms = ['windows10', 'windows', 'android', 'ios', 'chrome', 'firefox'];
          this.isAllChecked = true;
        }
    }
  },
  computed: {
    disableDownload() {
      if (this.labelFileName != 'Choose File') {
        return false;
      } else {
         return true;
      }
    }
  }
};
</script>