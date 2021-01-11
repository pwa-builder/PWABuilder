<template>
  <ScoreCard
    :url="url"
    :metrics="securityMetrics"
    :category="'Security'"
    :footerContent="securityFooterContent"
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
import { getCache, setCache } from "~/utils/caching";

@Component({ name: "SecurityScoreCard", components: { ScoreCard } })
export default class extends Vue {
  @Prop({ type: String }) url: string;
  securityResult: SecurityDataResults | null = null;
  securityTestDone: boolean = false;
  securityMetrics = [
    new ScoreCardMetric(
      "Uses <a target='_blank' rel='noopener' href='https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts'>HTTPS</a>",
      10,
      "required",
      () => this.getSecurityStatus((s) => s.data.isHTTPS)
    ),
    new ScoreCardMetric("Has a valid SSL certificate", 
      5, 
      "required", 
      () => this.getSecurityStatus((s) => s.data.validProtocol)
    ),
    new ScoreCardMetric(
      "No <a target='_blank' rel='noopener' href='https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content'>mixed content</a> on page",
      5,
      "required",
      () => this.getSecurityStatus((s) => s.data.valid)
    ),
  ];

  get securityScoreTotal(): number {
    const presentMetrics = this.securityMetrics
      .filter((o) => o.status === "present")
      .map((o) => o.points);
    if (presentMetrics.length === 0) {
      return 0;
    }

    return presentMetrics.reduce((a, b) => a + b);
  }

  created() {
    this.runSecurityChecks();
  }

  get securityFooterContent(): string {
    if (!this.securityTestDone) {
      return "";
    }

    if (!this.securityResult || !this.securityResult.data.isHTTPS) {
      return `<i class='fas fa-exclamation-circle'></i> We couldn't detect HTTPS.
              You can <a href="https://letsencrypt.org/">use LetsEncrypt</a> to get a free HTTPS certificate, 
              or <a href="https://azure.microsoft.com/en-us/get-started/web-app">publish to Azure</a> to get built-in HTTPS support.`;
    }

    return "";
  }

  private async runSecurityChecks(): Promise<void> {
    const cachedData: SecurityDataResults = getCache("security", this.url);
    try {
      this.securityResult = cachedData || (await this.fetchSecurityStatus());
    } catch (securityDetectionError) {
      console.warn("Failed to fetch security report", securityDetectionError);
      this.securityResult = null;
    }

    if (this.securityResult) {
      setCache("security", this.url, this.securityResult);
    }

    this.securityTestDone = true;
  }

  private async fetchSecurityStatus(): Promise<SecurityDataResults> {
    const encodedUrl = encodeURIComponent(this.url);
    const securityUrl = `${process.env.testAPIUrl}/Security?site=${encodedUrl}`;
    const fetchResult = await fetch(securityUrl);
    if (!fetchResult.ok) {
      throw new Error(
        "Error fetching security report: " + fetchResult.statusText
      );
    }

    const results: SecurityDataResults = await fetchResult.json();
    console.info("Security detection completed successfully", results);
    return results;
  }

  private getSecurityStatus(
    securityCheck: (results: SecurityDataResults) => boolean
  ): ScoreCardMetricStatus {
    if (!this.securityTestDone) {
      return "loading";
    }

    if (!this.securityResult) {
      return "missing";
    }

    return securityCheck(this.securityResult) ? "present" : "missing";
  }
}

interface SecurityDataResults {
  data: {
    isHTTPS: true;
    validProtocol: true;
    valid: true;
  };
}
</script>