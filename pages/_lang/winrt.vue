<template>
  <section>
        <div id="left">
            <section id="tiles">
                <div v-for="item in controls" :key="item">
                    <div class="card" v-on:click="focus(item, $event)">
                        <div class="cardinside">
                            <img class="cardimage" :src=item.image />
                            <div class="cardtextarea">
                                <div class="cardtopline">
                                    <div class="cardname">{{ item.title }}</div>
                                    <div class="cardcheck">
                                        <input type="checkbox" id="enable"
                                               v-on:change="check(item, $event)"
                                               v-model="item.included" />
                                    </div>
                                </div>
                                <div class="carddesc">{{ item.description }}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <button v-on:click="generate()">Generate</button>
                </div>
            </section>

            <div id="resizer">
            </div>

            <div id="source">
            </div>
        </div>

<!--
        <aside id="right" class="w3-sidebar w3-bar-block">
            <div class="tab">
                <button class="tablinks" onclick="openTab(event, 'PropertiesTab')">Properties</button>
                <button class="tablinks" onclick="openTab(event, 'SourceTab')">Source</button>
            </div>

            <div id="PropertiesTab" class="tabcontent active">
                <h5 class="w3-bar-item">Option Properties</h5>
                <div class="proparea">
                    <div v-for="prop in properties" :key="prop">
                        <div>{{prop.name}}</div>
                        <textarea :id="prop.id" :placeholder="prop.description" v-model="prop.default"
                                   v-on:change="changed(prop, $event)"
                                   v-on:input="changed(prop, $event)"
                                   v-on:onpropertychange="changed(prop, $event)">

                        </textarea>
                    </div>
                </div>
                <div class="propspacer"></div>
            </div>

            <div id="SourceTab" class="tabcontent" style="display: none;">
                <div id="Source">

                </div>
            </div>
        </aside>-->
  </section>
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'nuxt-class-component';
import { Action, State, Getter, namespace } from 'vuex-class';
import axios from 'axios'

import GeneratorMenu from '~/components/GeneratorMenu.vue';
import TwoWays from '~/components/TwoWays.vue';
import Modal from '~/components/Modal.vue';
import CodeViewer from '~/components/CodeViewer.vue';
import RelatedApplications from '~/components/RelatedApplications.vue';
import CustomMembers from '~/components/CustomMembers.vue';
import StartOver from '~/components/StartOver.vue';
import ColorSelector from '~/components/ColorSelector.vue';

import * as generator from '~/store/modules/generator';

const GeneratorState = namespace(generator.name, State);
const GeneratorActions = namespace(generator.name, Action);
const GeneratorGetters = namespace(generator.name, Getter);

@Component({
  components: {
      
  }
})

export default class extends Vue {
  asyncData ({ params }) {
    return axios.get(`http://localhost:15336/api/source`)
    .then((res) => {

      let fromItem = function (func, file, source) {
        let id = file.Id + "." + func.Name;

        let parms = Array<any>();

        for (let i = 0; i < func.Parameters.length; i++) {
            let parm = func.Parameters[i];
            let newParm = {
                name: parm.Name,
                id: id + "." + parm.Name,
                default: parm.Default,
                type: parm.Type,
                description: parm.Description
            };

            parms.push(newParm);
        }

        return {
            title: func.Name || file.Name || source.Name,
            description: func.Description || file.Description || source.Description,
            image: func.Image || file.Image || source.Image,
            id: file.Id + "." + func.Name,
            parms: parms,
            url: source.Url,
            hash: source.Hash,
            included: false,
            comments: func.Comments
        }    
      }

      let results = Array<any>();

      for (var s = 0; s < res.data.Sources.length; s++) {
          var source = res.data.Sources[s];
          var file = source.Parsed.File;
          for (var f = 0; f < source.Parsed.Functions.length; f++) {
              var fn = source.Parsed.Functions[f];
              var newItem = fromItem(fn, file, source);
              results.push(newItem);
          }
      }

      return { controls: results }
    })
  }
}
</script>

<style lang="scss" scoped>
@import "~assets/scss/base/variables";

.generate {
  &-code {
    margin-top: -2rem;
  }
}
</style>

<style>
  .page {
    background: #CCCCCC;
    padding-top: 60px;
  }

  .cardround {
    font-family: "Segoe UI", Frutiger, "Frutiger Linotype", "Dejavu Sans", "Helvetica Neue", Arial, sans-serif;
    margin: 10px;
    padding: 0px;
    height: 310px;
    width: 200px;
    border: black solid 1px;
    border-radius: 4px;
    background: white;
    box-shadow: 5px 5px 5px #999999;
    display: block;
    float: left;
  }

  .card {
    font-family: "Segoe UI Semilight","Segoe WP Semilight","Segoe WP","Segoe UI",Arial,Sans-Serif;
    margin: 10px;
    padding: 0px;
    width: 200px;
    height: 310px;
    border: black solid 1px;
    background: white;
    box-shadow: 5px 5px 5px #999999;
    display: block;
    float: left;
  }

  .cardname {
    font-size: 20px;
    font-style: normal;
    font-variant: normal;
    font-weight: 300;
    flex: 0 0 90%;
  }

  .cardimage {
    width: 198px;
    height: auto;
    max-height: 198px;
    opacity: 0.8;
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
    font-family: "Segoe UI","Segoe WP",Arial,Sans-Serif;
    font-size: 13px;
    font-style: normal;
    font-variant: normal;
    font-weight: 400;
    bottom: 10px;
    margin-right: 5px;
    position: absolute;
    vertical-align: bottom;
  }

  .cardinside {
    position: absolute;
    height: 310px;
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
</style>
<style>
  #tiles {
      width: 100%;
      height: 75%;
      display: block;
  }

  #left {
      float: left;
      display: block;
      width: 75%;
  }

  #right {
      width: 25%;
      right: 0;
      float: right;
  }

  .CodeMirror {
      display: block;
      height: 25%;
      clear: both;
      width: 100%;
      background: #ddd;
  }

  #SourceTab {
      height: 100%;
  }

  #SourceTab > .CodeMirror {
      height: 100%;
  }
    
  .CodeMirror-scroll {
      height: 90% !important;
  }
</style>