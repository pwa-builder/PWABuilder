<template>
  <section>
    <WinrtMenu />
    <section class="l-generator-step">
      <section class="twoways l-pad">
        <div class="pure-g">
          <div class="pure-u-1 pure-u-md-1-2" v-for="item in controls" :key="item.id" v-on:click="onclick(item, $event)">
            <div class="pwa-infobox-box">
              <img class="pwa-infobox-logo" src="~/assets/images/logo_small.png" alt="Small PWA Builder logo">
              <h4 class="pwa-infobox-subtitle">{{ item.title }}</h4>
              <div class="cardcheck">
                <div>{{ item.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div class="tab_container" v-if="properties">
        <input id="tab1" type="radio" name="tabs" class="tab_input" checked>
			  <label for="tab1" class="tab_label"><i class="fa fa-code"></i><span>Setup Snippet</span></label>

        <input id="tab2" type="radio" name="tabs" class="tab_input">
        <label for="tab2" class="tab_label"><i class="fa fa-pencil-square-o"></i><span>Source Code</span></label>

        <section id="content1" class="tab-content tab_section">
          <div class="pure-g">
            <div class="pure-u-1 pure-u-md-1-5">
              <h4 class="l-generator-subtitle">
                {{ selectedTitle }}
              </h4>
            </div>
          </div>
          <br/>
          <div class="pure-g">
            <div class="l-generator-semipadded pure-u-1 pure-u-md-1-2">
              <div class="l-generator-form ">
                <div class="l-generator-field" v-for="prop in properties" :key="prop.id">
                  <label class="l-generator-label">{{prop.name}}
                    <a class="l-generator-link" href="https://www.w3.org/TR/appmanifest/#name-member" target="_blank">[?]</a>
                  </label>
                  <input class="l-generator-input" :id="prop.id" :placeholder="prop.description" v-model="prop.default" type="text">
                </div>
              </div>
              <div class="pure-u-1 pure-u-md-1-2">
                <div class="pwa-button pwa-button--simple" v-if="properties" v-on:click="download()">{{ $t("winrt.download") }}</div>
              </div>
            </div>
            <CodeViewer v-if="properties" :code="getCode()" class="code pure-u-1 pure-u-md-1-2" />
          </div>
        </section>
        <section id="content2" class="tab-content tab_section">
          <div class="pure-g">
            <CodeViewer v-if="properties" :code="source" class="source pure-u-1 pure-u-md-5-5" />
          </div>
        </section>
      </div>
    </section>
  </section>
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'nuxt-class-component';
import axios from 'axios';
import { Prop } from 'vue-property-decorator';
import CodeViewer from '~/components/CodeViewerReduced.vue';
import WinrtMenu from '~/components/WinRtMenu.vue';

@Component({
  components: {CodeViewer, WinrtMenu}
})
export default class Winrt extends Vue {
  @Prop({ type: String, default: '' })
  public code: string | null;
  
  @Prop({ type: String, default: '' })
  public source: string | null;

  @Prop()
  properties: any;

  controls: any;

  selectedTitle: string | null;

  async asyncData({ params }) {
    return await axios.get(`http://renoserviceapi.azurewebsites.net/api/source`).then(res => {
      let fromItem = function(func, file, source) {
        let id = file.Id + '.' + func.Name;

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
          comments: func.Comments
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

  getCode(): string | null {
    return this.code;
  }

  async onclick(item, event) {
      await axios.get(item.url).then(data => {
        this.code = item.comments;
        this.source = data.data;
        this.properties = item.parms;
        this.selectedTitle = item.title;
    });
  }

  download() {
    let that = this;
    let results = this.outputProcessor(this.controls);

    axios('http://localhost:15336/api/source/generate', {
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(results),
      method: 'POST'
    })
    .then(res => {
      let fileName = 'snippet.zip';
      that.saveAs(fileName, res);
    });
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
.cardround {
  background: white;
  border: black solid 1px;
  border-radius: 4px;
  box-shadow: 5px 5px 5px #999999;
  display: block;
  float: left;
  font-family: "Segoe UI", Frutiger, "Frutiger Linotype", "Dejavu Sans", "Helvetica Neue", Arial, sans-serif;
  height: 310px;
  margin: 10px;
  padding: 0;
  position: relative;
  width: 200px;
}

.cardname {
  flex: 0 0 90%;
  font-size: 20px;
  font-style: normal;
  font-variant: normal;
  font-weight: 300;
}

.cardimage {
  height: auto;
  max-height: 198px;
  opacity: .8;
  width: 198px;
}

.cardtextarea {
  margin: 5px;
}

.cardtopline {
  display: flex;
}

.cardcheck {
  flex: 1;
  margin-top: 5px;
}

.carddesc {
  bottom: 10px;
  font-family: "Segoe UI", "Segoe WP", Arial, Sans-Serif;
  font-size: 13px;
  font-style: normal;
  font-variant: normal;
  font-weight: 400;
  margin-right: 5px;
  position: absolute;
  vertical-align: bottom;
}

.cardinside {
  height: 310px;
  position: absolute;
}

.proparea {
  margin: 20px;
}

.propspacer {
  height: 20px;
}

.fullline {
  display: block;
}

.source {
  background: #DDDDDD;
  clear: both;
  display: block;
  float: right;
  height: 50%;
  right: 0;
  width: 100%;
}

.code {
  background: #DDDDDD;
  clear: both;
  display: block;
  float: right;
  height: 50%;
  right: 0;
  width: 50%;
}

/* Tabs */
.tab_container {
  margin: 0 auto;
  padding-top: 70px;
  position: relative;
  width: 90%;
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
  width: 20%;
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