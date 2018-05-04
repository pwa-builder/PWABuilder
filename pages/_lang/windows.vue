<template>
  <section>
    <WindowsMenu />
      <div class="l-generator-step">
        <div class="l-generator-semipadded pure-g">
          <div class="pure-u-1 pure-u-md-1-3 generator-section service-workers">
            <div class="l-generator-subtitle">{{ $t('windows.title') }}</div>
            <div class="l-generator-field l-generator-field--padded checkbox" v-for="item in controls" :key="item.id">
              <label class="l-generator-label">
                <input type="radio" :value="item" v-model="windowsfeature"> {{item.title}}
              </label>
              <span class="l-generator-description">{{ item.description }}</span>
            </div>
          </div>
          <div class="pure-u-1 pure-u-md-2-3">
            <div class="tab_container" >
                <input id="tab1" type="radio" name="tabs" class="tab_input" checked>
                <label for="tab1" class="tab_label"><i class="fa fa-code"></i><span> Usage</span></label>

                <input id="tab2" type="radio" name="tabs" class="tab_input">
                <label for="tab2" class="tab_label"><i class="fa fa-file-alt"></i><span> Code</span></label>

                <section id="content1" class="tab-content tab_section">
                  <br/>
                  <div class="pure-g">
                    <div class="generate-code pure-u-1">
                      <CodeViewer :code="snippet" :title="$t('windows.codeTitle')" />
                      <br/>
                      <div class="l-generator-form ">
                        <div class="l-generator-field" v-for="prop in properties" :key="prop.id">
                          <label class="l-generator-label">{{prop.name}}
                            <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#name-member" target="_blank">[?]</a>
                          </label>
                          <input class="l-generator-input" :id="prop.id" :placeholder="prop.description" v-model="prop.default" type="text">
                        </div>
                      </div>
                      <div class="pure-u-1 pure-u-md-1-2">
                        <div class="pwa-button pwa-button--simple" v-on:click="download()">{{ $t("windows.download") }}</div>
                      </div>
                    </div>
                  </div>
                </section>
                <section id="content2" class="tab-content tab_section">
                  <CodeViewer :size="viewerSize" :code="source" :title="$t('windows.sourceTitle')">
                    <div class="pwa-button pwa-button--simple pwa-button--brand pwa-button--header" v-if="properties" v-on:click="download()">{{ $t("windows.download") }}</div>      
                  </CodeViewer>
                </section>
              </div>
          </div>
        </div>
      </div>
  </section>
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'nuxt-class-component';
import axios from 'axios';
import { Prop } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';
import CodeViewer from '~/components/CodeViewer.vue';
import WindowsMenu from '~/components/WindowsMenu.vue';

@Component({
  components: {CodeViewer, WindowsMenu}
})
export default class windows extends Vue {
  @Prop({ type: String, default: '' })
  public snippet: string | null;
  
  @Prop()
  public windowsfeature: any;

  @Prop({ type: String, default: '' })
  public source: string | null;

  @Prop()
  properties: any;
  error: any;
  controls: any;

  selectedTitle: string | null;
  public viewerSize = '30rem';

  mounted(){
    this.windowsfeature = this.controls[0];
  }

  @Watch('windowsfeature')
  async onwindowsfeatureChanged() {
    try {
      await this.onchange(this.windowsfeature);
    } catch (e) {
      this.error = e;
    }
  }

  async asyncData() {
    return await axios.get(`${process.env.apiUrl2}/api/winrt`).then(res => {
      let fromItem = function(func, file, source) {
        let id = file.Id + '.' + func.Name; //file.id is undefined

        let parms = Array<any>();

        for (let i = 0; i < func.Parameters.length; i++) {
          let parm = func.Parameters[i];
          let newParm = {
            name: parm.Name,
            id: id + '.' + parm.Name,
            default: parm.Default,
            type: parm.Type,
            description: parm.Description
          };

          parms.push(newParm);
        }

        return {
          title: func.Name || file.Name || source.Name,
          description:
          func.Description || file.Description || source.Description,
          image: func.Image || file.Image || source.Image || './assets/images/logo_small.png',
          id: file.Id + '.' + func.Name,
          parms: parms,
          url: source.Url,
          hash: source.Hash,
          included: false,
          snippet: func.Snippet
        };
      };

      let results = Array<any>();

      if (res.data.Sources) {
        for (let s = 0; s < res.data.Sources.length; s++) {
          const source = res.data.Sources[s];
          const file = source.Parsed.File;
          for (let f = 0; f < source.Parsed.Functions.length; f++) {
            const fn = source.Parsed.Functions[f];
            const newItem = fromItem(fn, file, source);

            results.push(newItem);
          }
        }
      }

      return { controls: results };
    });
  }

  async onchange(item) {
      //change comment name property

      await axios.get(item.url).then(data => {
        this.snippet = item.snippet.replace(/(\/\*[\s\S]*?\*\/|([^:/]|^)\/\/.*$)/g, '');
        this.source = data.data.replace(/(\/\*[\s\S]*?\*\/|([^:/]|^)\/\/.*$)/g, '');
        this.properties = item.parms;
        this.selectedTitle = item.title;
    });
  }

  async download() {
    let that = this;
    let items = Array<any>();
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            let fileName = 'snippet.zip';
            that.saveAs(fileName, xhttp);
        }
    };

    xhttp.open('POST', `${process.env.apiUrl2}/api/winrt/generate`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhttp.responseType = 'blob';

    items.push(this.windowsfeature)
    let results = this.outputProcessor(items);
    xhttp.send(JSON.stringify(results));
  }

  outputProcessor(items) {
    let results = Array<any>();

    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      
      let newItem = {
          id: item.id,
          url: item.url,
          hash: item.hash,
          parms: Array<any>()
      };

      for (let j = 0; j < item.parms.length; j++) {
        newItem.parms.push({
            id: item.parms[j].id,
            defaultData: item.parms[j].default
        });
      }

      results.push(newItem);
    }

    return {controls: results};
  }

  saveAs(fileName, xhttp) {
    let a = document.createElement('a');
    a.href = window.URL.createObjectURL(xhttp.response);
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
  } 
}
</script>

<style>
/* Tabs */
.tab_container {
  margin: 0 auto;
  position: relative;
  width: 100%;
}

.tile-table {
  margin: 32px !important;
}

.tab_input,
.tab_section {
  clear: both;
  display: none;
  padding-top: 10px;
}

.tab_label {
  background: #F0F0F0;
  color: #757575;
  cursor: pointer;
  display: block;
  float: left;
  font-size: 18px;
  font-weight: 700;
  padding: 1.5em;
  text-align: center;
  text-decoration: none;
  width: 30%;
}

#tab1:checked ~ #content1,
#tab2:checked ~ #content2 {
  background: #FFFFFF;
  border-bottom: 2px solid #F0F0F0;
  color: #999999;
  display: block;
  padding: 20px;
}

.tab_container .tab-content div {
  -webkit-animation: fadeInScale .7s ease-in-out;
  -moz-animation: fadeInScale .7s ease-in-out;
  animation: fadeInScale .7s ease-in-out;
}

.tab_container .tab-content h3 {
  text-align: center;
}

.tab_container [id^="tab"]:checked + label {
  background: #FFFFFF;
  box-shadow: inset 0 3px #00CCEE;
}

.tab_label .fa {
  font-size: 1.3em;
  margin: 0 .4em 0 0;
}

.tab_container [id^="tab"]:checked + label .fa {
  color: #00CCEE;
}

/* Media query */
@media only screen and (max-width: 930px) {
  .tab_label span {
    font-size: 14px;
  }

  .tab_label .fa {
    font-size: 14px;
  }
}

@media only screen and (max-width: 768px) {
  .tab_label span {
    display: none;
  }

  .tab_label .fa {
    font-size: 16px;
  }

  .tab_container {
    width: 98%;
  }
}
</style>

<style lang="scss" scoped>
@import "~assets/scss/base/variables";

.generate {
  &-code {
    margin-top: -2rem;
  }
}
</style>