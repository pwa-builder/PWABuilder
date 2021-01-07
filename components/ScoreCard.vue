<template>
  <div class="scoreCard">
    <div class="headerDiv">
      <h3>{{ category }}</h3>

      <div class="cardScore">
        <span class="subScore">{{ currentScore }}</span> / {{ maxScore }}
      </div>
    </div>

    <div class="cardContent">

      <div v-for="metricSection in metricSections" v-bind:key="metricSection.name">
        <h4>{{metricSection.name}}</h4>
        <ul>
            <li v-for="metric in metricSection.metrics" v-bind:key="metric.name" v-bind:class="{ good: metric.status === 'present' }">
              <div class="listSubDiv">
                <span class="cardIcon" aria-hidden="true">
                  <i class="fas fa-fw" v-bind:class="{ 
                    'fa-check': metric.status === 'present', 
                    'fa-times': metric.status === 'missing', 
                    'fa-exclamation-triangle': metric.status === 'unknown',
                    'fa-spinner fa-spin': metric.status === 'loading'
                  }"></i>
                </span>

                <span v-html="metric.name"></span>
              </div>

              <span class="subScoreSpan">
                <span v-if="metric.status === 'present'">{{metric.points}}</span>
                <span v-if="metric.status === 'missing'">0</span>
              </span>
            </li>
        </ul>
      </div>
      
    </div>

    <div class="cardEditBlock" v-html="footerContent"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Prop } from "vue-property-decorator";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

import * as generator from "~/store/modules/generator";
import { ScoreCardCheckCompletedEvent, ScoreCardMetric } from "~/utils/score-card-metric";
import nuxtConfig from "nuxt.config";

const GeneratorState = namespace(generator.name, State);
const GeneratorAction = namespace(generator.name, Action);

@Component({})
export default class extends Vue {
  @GeneratorAction getManifestInformation;
  @GeneratorState manifest: any;

  @GeneratorAction updateManifest;

  @Prop() public category: string;
  @Prop() public footerContent: string | null;
  @Prop() public footerUrl: string | null;
  @Prop() public url: string;
  @Prop() public metrics: ScoreCardMetric[];
  
  maxScore: number;
  metricSections: { name: string, metrics: ScoreCardMetric[] }[] = [];
  allChecksComplete = false;

  created() {
    this.metricSections = [
      { name: "Required", metrics: this.metrics.filter(m => m.category === "required") },
      { name: "Recommended", metrics: this.metrics.filter(m => m.category === "recommended") },
      { name: "Optional", metrics: this.metrics.filter(m => m.category === "optional") }
    ].filter(s => s.metrics.length > 0);

    this.maxScore = this.metrics.length === 0 ? 0 : this.metrics
      .map(m => m.points)
      .reduce((a, b) => a + b);

    // For each metric, override its status function to check if the tests are done.
    this.metrics.forEach(m => m.statusChanged = () => this.checkForCompleted());

    // The footer of the card may contain links into the app, e.g. /generate.
    // However, Nuxt doesn't see these as nav links. So we have to handle those specially here.
    const cardEditorLinks = document.querySelectorAll(".cardEditBlock a");
    cardEditorLinks.forEach(i => {
      const href = i.getAttribute("href");
      if (href && href.startsWith("/")) {
        i.addEventListener("click", (e) => {
          e.preventDefault();
          console.log("zanz navigating to", href);
          setTimeout(() => this.$router.push({
            name: "generate"
          }), 3000);
        });
      }
    });
  }

  get currentScore(): number {
    const presentPoints = this.metrics
      .filter(m => m.status === "present")
      .map(m => m.points);

    if (presentPoints.length === 0) {
      return 0;
    }

    return presentPoints.reduce((a, b) => a + b);
  }

  checkForCompleted() {
    // Fire the "all-checks-complete" event if we're done.
    if (!this.allChecksComplete && this.metrics.every(m => m.lastStatus !== "loading")) {
      this.allChecksComplete = true;
      const meetsRequirements = this.metrics
        .filter(m => m.category === "required")
        .every(m => m.lastStatus === "present");
      const eventArgs: ScoreCardCheckCompletedEvent = {
        score: this.currentScore,
        meetsRequirements: meetsRequirements,
        metrics: this.metrics
      };
      this.$emit("all-checks-complete", eventArgs);
    }
  }
}
</script>

<style lang="scss" scoped>
.cardScore {
  color: #707070;
  font-weight: bold;
  font-size: 12px;

  .subScore {
    color: #707070;
    font-size: 24px;
  }
}

.cardContent {
  flex: 1;
}

.scoreCard {
  background: white;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  padding-top: 24px;
  padding-left: 30px;
  padding-right: 30px;
  min-height: 404px;

  .cardEditBlock {
    text-align: center;
    background: none;
    border: none;
    font-size: 0.9em;
    padding: 20px;
  }

  .headerDiv {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    align-items: center;
  }

  h4,
  h3 {
    color: black;

    font-family: sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 15px;
    line-height: 18px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  h4 {
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 12px;
  }

  ul {
    flex-grow: 2;
    list-style: none;
    padding: 0;
    margin: 0;
    margin-bottom: 42px;

    li.good {
      font-weight: normal;
      color: initial;

      .cardIcon {
        margin-right: 16px;
        color: initial;
        color: #707070;
        font-size: 12px;
      }

      .subScoreSpan {
        font-size: 14px;
        font-weight: bold;
        color: #707070;
      }
    }

    li {
      font-size: 14px;
      font-weight: bold;
      padding: 0.5em;
      padding-left: 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 5px;
      color: #3c3c3c span {
        font-style: normal;
        font-weight: normal;
        font-size: 14px;
        line-height: 18px;
        color: #3c3c3c;
      }

      .listSubDiv {
        display: flex;
        margin-right: 11px;
        align-items: center;
        font-family: "Open Sans", sans-serif;
      }

      .subScoreSpan {
        font-size: 14px;
        font-weight: bold;
        color: #db3457;
      }

      .cardIcon {
        color: #db3457;
        margin-right: 16px;
        font-size: 12px;
      }

      code {
        padding: 3px;
        background: rgba(60, 60, 60, 0.05);
        border-radius: 4px;
        height: 24px;
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 14px;
        padding-left: 8px;
        padding-right: 8px;
        color: #000000;
      }
    }
  }

  #extrasP {
    flex-grow: 2;
  }

  #noSWP,
  #noManifest {
    flex-grow: 2;
    margin-bottom: 2em;
  }

  .skeletonSpan {
    background: linear-gradient(
      to right,
      rgba(140, 140, 140, 0.8),
      rgba(140, 140, 140, 0.18),
      rgba(140, 140, 140, 0.33)
    );
    background-size: 800px 104px;
    animation-duration: 1s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: shimmer;
    animation-timing-function: linear;
    height: 1em;
    width: 100%;
  }

  @keyframes shimmer {
    0% {
      background-position: -468px 0;
    }

    100% {
      background-position: 468px 0;
    }
  }

  .brkManifestError {
    color: #c90005;
    font-weight: bold;
    padding-top: 1em;
    padding-bottom: 1em;
    font-size: 14px;
    text-align: center;
  }

  .waitingText {
    color: black;
    font-weight: bold;
    padding-top: 1em;
    padding-bottom: 1em;
    font-size: 14px;
    text-align: center;
  }

  #timedOutText {
    color: #ff7300;
    font-weight: normal;
    padding-bottom: 1em;
    font-size: 14px;
    display: flex;
  }

  #timedOutText i {
    margin-right: 6px;
    font-size: 18px;
  }

  .brkManifestHelp {
    color: rgb(92, 92, 92);
    font-size: 13px;
  }
}
</style>