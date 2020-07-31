<template>
  <div>
    <HubHeader title="Image Generator" :expanded="true"></HubHeader>
    <main id="main" class="main" role="presentation">
      <div>
        <p>Quickly and easily create app icons for various platforms in the right size and format</p>

        <form
          id="imageFileInputForm"
          class="form"
          enctype="multipart/form-data"
          role="form"
          ref="form"
        >
          <section class="form-left">
            <h4>Image Details</h4>
            <p>Specify the image details below.</p>
            <div>
              <h3>Input Image</h3>
              <label id="fileNameLabel" for="fileName" ref="fileNameLabel">{{labelFileName}}</label>
              <input id="fileName" name="fileName" type="file" ref="fileName" @change="changeLabel" />
              <button id="inputFile" class="utility" @click="selectInputFile">Choose File</button>
            </div>
            <div>
              <h3>Padding</h3>
              <input name="padding" type="number" value="0.3" min="0" step="any" />
              <small>0 is no padding, 1 is 100% of the source image. 0.3 is a typical value for most icons</small>
            </div>
            <div class="color-section">
              <h3>Background Color</h3>

              <div class="color-radio">
                <input type="radio" name="colorOption" checked="checked" value="transparent" />
                <label for="transparent">Transparent</label>
                <input type="radio" name="colorOption" value="choose" />
                <label for="choose">Custom color</label>
              </div>

              <div class="color-chooser">
                <input type="color" />
                <input placeholder="#000000" name="color" id="color" type="text" />
                <input type="hidden" name="colorChanged" id="colorChanged" value="0" />
                <small>Choose a color for the background (leave blank to default to the pixel at the top left)</small>
              </div>
            </div>
          </section>
          <section class="form-right">
            <h4>Platforms</h4>
            <p>Select the platforms to generate images for.</p>
            <p>(*) windows platform generates images for Windows 8.1 and Windows Phone 8.1 apps.</p>
            <div>
              <div ref="checkPlatforms">
                <div>
                  <label>
                    <input type="checkbox" name="platform" value="windows10" v-model="platforms" />
                    windows10
                  </label>
                </div>
                <div>
                  <label>
                    <input type="checkbox" name="platform" value="windows" v-model="platforms" />
                    windows *
                  </label>
                </div>
                <div>
                  <label>
                    <input type="checkbox" name="platform" value="android" v-model="platforms" />
                    android
                  </label>
                </div>
                <div>
                  <label>
                    <input type="checkbox" name="platform" value="ios" v-model="platforms" />
                    ios
                  </label>
                </div>
                <div>
                  <label>
                    <input type="checkbox" name="platform" value="chrome" v-model="platforms" />
                    chrome
                  </label>
                </div>
                <div>
                  <label>
                    <input type="checkbox" name="platform" value="firefox" v-model="platforms" />
                    firefox
                  </label>
                </div>
                <div>
                  <button
                    id="selectPlatforms"
                    class="secondary"
                    @click.prevent="checkAll"
                  >Select/Clear All</button>
                </div>
              </div>
            </div>
          </section>
          <section id="submit" class="form-bottom">
            <button
              id="downloadButton"
              class="primary"
              ref="downloadButton"
              v-on:click.prevent="useAPI"
              :disabled="disableDownload"
            >
              Download
              <span v-if="isLoading">
                <i aria-hidden="true"></i>
              </span>
            </button>
          </section>
        </form>
      </div>
    </main>
    <footer id="hubFooter" class="footer">
      <p>
        PWA Builder was founded by Microsoft as a community guided, open source
        project to help move PWA adoption forward.
        <a
          href="https://privacy.microsoft.com/en-us/privacystatement#maincookiessimilartechnologiesmodule"
        >Our Privacy Statement</a>
      </p>
    </footer>
  </div>
</template>

<script lang='ts'>
import axios from "axios";
import HubHeader from "~/components/HubHeader.vue";
import GeneratorMenu from "~/components/GeneratorMenu.vue";

export default {
  components: { HubHeader, GeneratorMenu },

  data() {
    return {
      titulo: "App Image Generator",
      labelFileName: "Choose File",
      isLoading: false,
      isAllChecked: true,
      platforms: [
        "windows10",
        "windows",
        "android",
        "ios",
        "chrome",
        "firefox",
      ],
    };
  },

  methods: {
    useAPI() {
      this.isLoading = true;

      const urlUseAPI = process.env.apiUrl2 + "/";
      const formData = new FormData(this.$refs.form);

      axios.post(urlUseAPI + "api/image", formData).then((result) => {
        const fileUri = result.data.Uri;
        this.safeDownload(urlUseAPI, fileUri);
        this.isLoading = false;
      });
    },
    safeDownload(APIUseUrl: string, fileURI: string) {
      const link = document.createElement("a");
      link.href = APIUseUrl + fileURI.substring(1);
      link.setAttribute("download", "PWABuilderImages");
      link.click();
    },
    changeLabel() {
      this.labelFileName = this.$refs.fileName.files[0].name;
    },
    checkAll() {
      if (this.isAllChecked) {
        this.platforms = [];
        this.isAllChecked = false;
      } else {
        this.platforms = [
          "windows10",
          "windows",
          "android",
          "ios",
          "chrome",
          "firefox",
        ];
        this.isAllChecked = true;
      }
    },
    selectInputFile() {
      const fileInput = document.getElementById("fileName");
      if (fileInput) {
        fileInput.click();
      }
    },
  },
  computed: {
    disableDownload() {
      if (this.labelFileName != "Choose File") {
        return false;
      } else {
        return true;
      }
    },
  },
};
</script>

<style lang="scss">
input {
  height: auto;
  width: auto;
}

body {
  font-family: helvetica, arial, sans-serif;
  color: white;
  // background: linear-gradient(#1fc2c8, #9337d8);
  // background-repeat: no-repeat;
  // background-color: #9337d8;
  margin: 0;

  background: linear-gradient(
      -8deg,
      #f0f0f0,
      #f0f0f0 25vh,
      rgba(255, 0, 0, 0) 25.1vh
    ),
    linear-gradient(
      19deg,
      #f0f0f0,
      #f0f0f0 23.86416vh,
      rgba(255, 0, 0, 0) 23.96416vh
    ),
    linear-gradient(-32deg, #9337d8, #1fc2c8);
  background-image: linear-gradient(
      -8deg,
      rgb(240, 240, 240),
      rgb(240, 240, 240) 25vh,
      rgba(255, 0, 0, 0) 25.1vh
    ),
    linear-gradient(
      19deg,
      rgb(240, 240, 240),
      rgb(240, 240, 240) 23.8642vh,
      rgba(255, 0, 0, 0) 23.9642vh
    ),
    linear-gradient(-32deg, rgb(147, 55, 216), rgb(31, 194, 200));
  background-position-x: 0px, 100%, 50%;
  background-position-y: center, center, center;
  background-size: 80.05% 100%, 20.05% 100%, 100% 100%;
  background-attachment: initial, initial, initial;
  background-origin: initial, initial, initial;
  background-clip: initial, initial, initial;
  background-color: initial;
  background-size: 80.05% 100%, 20.05% 100%, 100% 100%;
  background-repeat: no-repeat, no-repeat, no-repeat;
  background-position: 0, 100%, 50%;
  background-position-x: 0px, 100%, 50%;
  background-position-y: center, center, center;
}

.main {
  padding: 0 154px;

  button {
    font-family: helvetica, arial, sans-serif;
    color: #fff;
    height: 40px;
    border-radius: 20px;
    box-shadow: transparent;
    border: none;
    padding: 1px 6px;

    &.primary {
      // background: linear-gradient(90deg, #1fc2c8, #9337d8 116%);
      color: #3c3c3c;
      background: linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0.7));
    }
    &.secondary {
      background: #3c3c3c;
    }
    &.utility {
      color: #3c3c3c;
      border: 1px solid #3c3c3c;
      background: transparent;
    }
  }

  @media screen and (max-width: 1024px) {
    padding: 0 32px;
  }

  @media screen and (max-width: 425px) {
    padding: 0 16px;
  }
}

.form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 16px;
  row-gap: 16px;
  padding: 0 52px;
  margin-bottom: 2em;
}

.form-bottom {
  display: flex;
  justify-content: center;
  grid-column: 1 / span 2;
}

.footer {
  bottom: 0;
  position: fixed;
  display: flex;
  padding: 0 16px;
  color: #3c3c3c;
  background: #f0f0f0;
  justify-content: center;
}

.color-chooser {
  padding: 8px 0;
  vertical-align: middle;

  input[type="color"] {
    height: 26px;
    width: 26px;
    margin-right: 8px;
  }

  small {
    display: block;
  }
}
</style>