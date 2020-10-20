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
            <h2>Image Details</h2>
            <p>Specify the image details below.</p>
            <div class="image-section">
              <h3>Input Image</h3>
              <input
                id="fileName"
                class="file-chooser"
                name="fileName"
                type="file"
                ref="fileName"
                aria-label="Choose File"
                @change="changeLabel"
              />
            </div>
            <div class="padding-section">
              <h3>Padding</h3>
              <input
                class="padding-input"
                type="number"
                name="padding"
                value="0.3"
                min="0"
                step="0.1"
                aria-label="padding amount"
              />
              <small>0 is no padding, 1 is 100% of the source image. 0.3 is a typical value for most icons</small>
            </div>
            <div class="color-section">
              <h3>Background Color</h3>

              <div class="color-radio">
                <label>
                  <input
                    type="radio"
                    name="colorOption"
                    value="transparent"
                    aria-label="transparent background"
                    @change="colorRadioChanged"
                    :checked="colorRadio === 'transparent'"
                  />
                  <span aria-hidden="true">Transparent</span>
                </label>

                <label>
                  <input
                    type="radio"
                    name="colorOption"
                    value="choose"
                    aria-label="custom color background"
                    @change="colorRadioChanged"
                    :checked="colorRadio === 'choose'"
                  />
                  <span aria-hidden="true">Custom color</span>
                </label>
              </div>

              <div class="color-chooser" v-if="colorRadio === 'choose'">
                <input
                  id="colorPicker"
                  class="color-picker"
                  type="color"
                  aria-label="color picker"
                  :value="colorPickerColor"
                  @change="colorPickerChanged"
                />
                <input
                  id="color"
                  class="color-text"
                  type="text"
                  name="color"
                  aria-label="color picker text"
                  placeholder="#000000"
                  @change="colorPickerChanged"
                  :value="colorPickerColor"
                />
                <small>Choose a color for the background (leave blank to default to the pixel at the top left)</small>
              </div>
            </div>
          </section>
          <section class="form-right platforms-section">
            <h4>Platforms</h4>
            <p>Select the platforms to generate images for.</p>
            <small>(*) windows platform generates images for Windows 8.1 and Windows Phone 8.1 apps.</small>
            <div class="platform-list" ref="checkPlatforms" role="group">
              <label>
                <input type="checkbox" name="platform" value="windows10" v-model="platforms" />
                windows10
              </label>
              <label>
                <input type="checkbox" name="platform" value="windows" v-model="platforms" />
                windows *
              </label>
              <label>
                <input type="checkbox" name="platform" value="msteams" v-model="platforms" />
                microsoft teams
              </label>
              <label>
                <input type="checkbox" name="platform" value="android" v-model="platforms" />
                android
              </label>
              <label>
                <input type="checkbox" name="platform" value="chrome" v-model="platforms" />
                chrome
              </label>
              <label>
                <input type="checkbox" name="platform" value="firefox" v-model="platforms" />
                firefox
              </label>
            </div>
            <button
              id="selectPlatforms"
              class="secondary"
              @click.prevent="checkAll"
            >Select/Clear All</button>
          </section>
          <section id="submit" class="form-bottom">
            <button
              id="downloadButton"
              class="primary"
              ref="downloadButton"
              v-on:click.prevent="useAPI"
              :disabled="disableDownload"
            >
              <span v-if="isLoading">
                <Loading :active="true"></Loading>
              </span>
              <span v-else>Download</span>
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
import Loading from "~/components/Loading.vue";

export default {
  components: { HubHeader, GeneratorMenu, Loading },

  data() {
    return {
      titulo: "App Image Generator",
      labelFileName: "Choose File",
      isLoading: false,
      isAllChecked: true,
      colorRadio: "transparent",
      colorPickerColor: "",
      platforms: [
        "windows10",
        "windows",
        "msteams",
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

      const urlUseAPI = process.env.imageGeneratorUrl + "/";
      const formData = new FormData(this.$refs.form);

      if (formData.get("color")) {
        formData.append("colorChanged", "1");
      }

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
          "msteams",
          "android",
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
    colorRadioChanged(evt) {
      this.colorRadio = evt.currentTarget.value;
    },
    colorPickerChanged(evt) {
      this.colorPickerColor = evt.currentTarget.value;
    },
  },
  computed: {
    disableDownload() {
      if (this.labelFileName === "Choose File" || this.isLoading) {
        return true;
      }

      return false;
    },
  },
};
</script>

<style lang="scss">
html,
body {
  height: 100%;
}

h3 {
  margin-bottom: 8px;
}

input {
  height: auto;
  width: auto;
}

small {
  display: block;
  margin: 8px 0;
}

#go-to-main {
  position: absolute;
  color: #1fc2c8 !important;
  left: 0;
  padding: 16px;
  z-index: -2;
}

#go-to-main:focus,
#go-to-main:active {
  color: #0078d4 !important;
  z-index: 800;
}

#selectPlatforms {
  width: 130px;
}

#downloadButton {
  width: 110px;
}

.container {
  @media screen and (max-width: 640px) {
    height: auto !important;
  }
}

.container > div,
.main {
  height: calc(100% - 104px);
}

body {
  display: flex;
  flex-direction: column;

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
  flex: 1 0 auto;
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

      &:disabled {
        cursor: not-allowed;
        color: #989898;
        border: 1px solid #989898;
        background: linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0.3));
      }
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

  @media screen and (max-width: 640px) {
    padding: 0 16px;
  }

  @media screen and (max-height: 600) {
    flex: 1 1 auto;
  }
}

.form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 16px;
  row-gap: 16px;
  padding: 0 52px;
  margin-bottom: 2em;

  @media screen and (max-width: 640px) {
    display: flex;
    flex-direction: column;
    padding: 0;
  }
}

.form-bottom {
  display: flex;
  justify-content: center;
  grid-column: 1 / span 2;
}

.footer {
  display: flex;
  padding: 0 16px;
  color: #3c3c3c;
  background: #f0f0f0;
  font-size: 12px;
  line-height: 18px;
  flex-shrink: 0;
  text-align: center;
  justify-content: center;

  p,
  a {
    color: rgba(60, 60, 60, 0.6);
    text-align: center;
    font-size: 12px;
    line-height: 18px;
  }

  a {
    box-shadow: none;
    color: inherit;
    text-decoration: underline;
  }

  @media screen and (max-width: 542px) {
    display: none;
  }
}

.image-section,
.padding-section {
  margin-bottom: 16px;
}

.padding-section {
  .padding-input {
    width: 60px;
  }
}

.color-chooser {
  padding: 8px 0;
  vertical-align: middle;

  input[type="text"],
  input[type="color"] {
    vertical-align: middle;
  }

  input[type="color"] {
    height: 26px;
    width: 26px;
    margin-right: 8px;
  }

  input {
    width: 120px;
  }
}

.color-radio,
.platform-list {
  display: flex;
  flex-direction: column;

  label {
    display: block;

    input[type="radio"],
    input[type="checkbox"] {
      vertical-align: middle;
    }
  }

  label + label {
    margin-top: 8px;
  }
}

.platforms-section {
  button {
    margin-top: 16px;
  }
}
</style>