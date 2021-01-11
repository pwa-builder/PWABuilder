<template>
  <ScoreCard
    :url="url"
    :metrics="serviceWorkerMetrics"
    :category="'Service worker'"
    :footerContent="chooseServiceWorkerContent"
    :footerNavUrl="'/serviceworker'"
    :footerNavContent="serviceWorkerLinkContent"
    v-on:all-checks-complete="$emit('all-checks-complete', $event)"
    class="scoreCard"
  ></ScoreCard>
</template>

<script lang="ts">
import Vue from "vue";
import ScoreCard from "~/components/ScoreCard.vue";
import Component from "nuxt-class-component";
import {
  ScoreCardMetric,
  ScoreCardMetricStatus,
} from "~/utils/score-card-metric";
import { Prop } from "vue-property-decorator";
import { ServiceWorkerDetectionResult } from "~/store/modules/generator";
import { ServiceWorkerChecker } from "~/utils/service-worker-checker";

@Component({ name: "ServiceWorkerScoreCard", components: { ScoreCard } })
export default class extends Vue {
  @Prop({ type: String }) url: string;
  serviceWorkerData: ServiceWorkerDetectionResult | null = null;
  serviceWorkerLoadFinished = false;
  noServiceWorker: boolean | null = null;
  timedOutSW: boolean = false;
  worksOffline: boolean | null = null; // null means the test isn't complete yet
  hasPeriodicSync: boolean | null = null; // null means the test isn't complete yet

  serviceWorkerMetrics = [
    new ScoreCardMetric("Has a service worker", 20, "required", () =>
      this.getMetricState((sw) => sw.hasSW)
    ),
    new ScoreCardMetric(
      "Has the correct <a target='_blank' rel='noopener' href='https://developers.google.com/web/ilt/pwa/introduction-to-service-worker#registration_and_scope'>scope</a>",
      5,
      "required",
      () => this.getMetricState((sw) => !!sw.scope)
    ),
    new ScoreCardMetric(
      "Works <a target='_blank' rel='noopener' href='https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers'>offline</a>",
      2,
      "recommended",
      () => this.getWorksOfflineStatus()
    ),
    new ScoreCardMetric(
      "Uses <a target='_blank' rel='noopener' href='https://web.dev/periodic-background-sync/'>periodic sync</a> for rich offline experience",
      2,
      "recommended",
      () => this.getPeriodicSyncStatus()
    ),
    new ScoreCardMetric(
      "Can receive <a target='_blank' rel='noopener' href='https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications'>push notifications</a>",
      1,
      "optional",
      () => this.getMetricState((sw) => sw.hasPushRegistration)
    ),
  ];

  get chooseServiceWorkerContent(): string {
    if (!this.serviceWorkerLoadFinished) {
      return "";
    }

    // Couldn't detect a SW? Show a warning message.
    if (
      !this.serviceWorkerData ||
      this.serviceWorkerData.serviceWorkerDetectionTimedOut
    ) {
      return `<i class='fas fa-exclamation-circle'></i> We couldn't detect a service worker.
              <a href='https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker'>Learn more about service workers</a>, or&nbsp;`;
    }

    return "";
  }

  get serviceWorkerLinkContent(): string {
    if (!this.serviceWorkerLoadFinished) {
      return "";
    }
    
    if (
      !this.serviceWorkerData ||
      this.serviceWorkerData.serviceWorkerDetectionTimedOut
    ) {
      return `<i class="fas fa-bolt"></i> choose a service worker recipe`;
    }

    return `<i class="fas fa-bolt"></i> Browse service worker recipes`;
  }

  created() {
    this.findServiceWorker();
  }

  private async findServiceWorker() {
    // If we have no URL, it means there was an issue parsing the URL,
    // for example, malformed URL.
    // In such case, punt; there is no service worker.
    const isHttp =
      typeof this.url === "string" && this.url.startsWith("http://");
    if (!this.url || isHttp) {
      this.noSwScore();
      return;
    }

    // We run 3 checks concurrently:
    // Detect the service worker
    // Detect offline support
    // Detect periodic sync support
    //
    // Offline and periodic sync are checked separately because they are longer-running process and
    // we want to give more immediate feedback to the user.
    const fetcher = new ServiceWorkerChecker(this.url);
    const detectServiceWorkerTask = fetcher.detectServiceWorker();
    const detectOfflineTask = fetcher.detectOfflineSupport();
    const detectPeriodicSyncTask = fetcher.detectPeriodicSyncSupport();

    // Wait for the service worker check to come in and update the score accordingly.
    let serviceWorkerResult: ServiceWorkerDetectionResult | null = null;
    try {
      serviceWorkerResult = await detectServiceWorkerTask;
      this.serviceWorkerData = serviceWorkerResult;
      this.noServiceWorker = serviceWorkerResult.hasSW === false;
      this.timedOutSW = serviceWorkerResult.serviceWorkerDetectionTimedOut;
    } catch (err) {
      this.noSwScore();
    } finally {
      this.serviceWorkerLoadFinished = true;
    }

    // If we don't have a service worker, we're done.
    if (!serviceWorkerResult) {
      this.worksOffline = false;
      this.hasPeriodicSync = false;
      this.noServiceWorker = true;
    } else {
      // Wait for the periodic sync check to come back
      try {
        this.hasPeriodicSync = await detectPeriodicSyncTask;
      } catch (periodicSyncDetectionError) {
        console.warn(
          "Error detecting periodic sync status",
          periodicSyncDetectionError
        );
        this.hasPeriodicSync = false;
      }

      // Wait for the offline check to come back
      try {
        this.worksOffline = await detectOfflineTask;
      } catch (offlineDetectionError) {
        console.warn(
          "Error checking offline support status",
          offlineDetectionError
        );
        this.worksOffline = false;
      }
    }
  }

  private noSwScore() {
    this.serviceWorkerLoadFinished = true;
    this.hasPeriodicSync = false;
    this.worksOffline = false;
    this.noServiceWorker = true;
  }

  private getMetricState(
    swCheck: (serviceWorker: ServiceWorkerDetectionResult) => boolean
  ): ScoreCardMetricStatus {
    if (this.noServiceWorker) {
      return "missing";
    }

    if (!this.serviceWorkerData || !this.serviceWorkerLoadFinished) {
      return "loading";
    }

    return swCheck(this.serviceWorkerData) ? "present" : "missing";
  }

  private getPeriodicSyncStatus(): ScoreCardMetricStatus {
    // Short circuit this: if we have no service worker, it won't have periodic sync.
    if (this.noServiceWorker) {
      return "missing";
    }
    
    if (this.hasPeriodicSync === null) {
      return "loading";
    }

    if (this.hasPeriodicSync) {
      return "present";
    }

    return "missing";
  }

  private getWorksOfflineStatus(): ScoreCardMetricStatus {
    // Short circuit this: if we have no service worker, it ain't gonna work offline.
    if (this.noServiceWorker) {
      return "missing";
    }
    
    if (this.worksOffline === null) {
      return "loading";
    }
    if (this.worksOffline) {
      return "present";
    }

    return "missing";
  }
}
</script>