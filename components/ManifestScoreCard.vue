<template>
  <ScoreCard
    :url="url"
    :metrics="manifestMetrics"
    :category="'Manifest'"
    :footerContent="editManifestContent"
    :footerNavUrl="'/generate'"
    :footerNavContent="editManifestLinkContent"
    v-on:all-checks-complete="$emit('all-checks-complete', $event)"
    id="firstCard"
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
import { getCache, setCache } from "~/utils/caching";
import { Prop } from "vue-property-decorator";
import { Manifest, ManifestContext } from "~/store/modules/generator";
import * as generator from "~/store/modules/generator";
import { Action, namespace } from "vuex-class";
import { findSuitableIcon } from "~/utils/icon-utils";
const GeneratorAction = namespace(generator.name, Action);

@Component({ name: "ManifestScoreCard", components: { ScoreCard } })
export default class extends Vue {
  @Prop({ type: String }) url: string;
  @GeneratorAction getManifestInformation: () => Promise<ManifestContext>;
  @GeneratorAction updateManifest: (manifest: ManifestContext) => void;
  manifest: ManifestContext | null = null;
  noManifest = false;
  manifestLoadFinished = false;

  manifestMetrics = [
    new ScoreCardMetric("Has a web manifest", 10, "required", () =>
      this.getStatus(() => true)
    ),
    new ScoreCardMetric(
      "Lists <a target='_blank' rel='noopener' href='https://developer.mozilla.org/en-US/docs/Web/Manifest/icons'>icons</a> for app install",
      5,
      "required",
      () => this.getStatus((m) => !!m.icons && m.icons.length > 0)
    ),
    new ScoreCardMetric(
      "Contains an app <a target='_blank' rel='noopener' href='https://developer.mozilla.org/en-US/docs/Web/Manifest/name'>name</a>",
      5,
      "required",
      () => this.getStatus((m) => !!m.name && m.name.length > 1)
    ),
    new ScoreCardMetric(
      "Contains an app <a target='_blank' rel='noopener' href='https://developer.mozilla.org/en-US/docs/Web/Manifest/short_name'>short_name</a>",
      5,
      "required",
      () => this.getStatus((m) => !!m.short_name && m.short_name.length > 1)
    ),
    new ScoreCardMetric(
      "Designates a <a target='_blank' rel='noopener' href='https://developer.mozilla.org/en-US/docs/Web/Manifest/start_url'>start_url</a>",
      5,
      "required",
      () => this.getStatus((m) => !!m.start_url && m.start_url.length > 0)
    ),

    new ScoreCardMetric(
      "Specifies a <a target='_blank' rel='noopener' href='https://superpwa.com/doc/web-app-manifest-display-modes'>display mode</a>",
      2,
      "recommended",
      () =>
        this.getStatus((m) =>
          ["fullscreen", "standalone", "minimal-ui", "browser"].includes(
            m.display
          )
        )
    ),
    new ScoreCardMetric(
      "Has a <a target='_blank' rel='noopener' href='https://web.dev/add-manifest/#background-color'>background_color</a> for the app's splash screen",
      2,
      "recommended",
      () => this.getStatus((m) => !!m.background_color)
    ),
    new ScoreCardMetric(
      "Includes a <a target='_blank' rel='noopener' href='https://w3c.github.io/manifest/#description-member'>description</a> of the app's purpose",
      2,
      "recommended",
      () => this.getStatus((m) => !!m.theme_color)
    ),
    new ScoreCardMetric(
      "Specifies a default <a href='https://developer.mozilla.org/en-US/docs/Web/Manifest/orientation'>orientation</a>",
      2,
      "recommended",
      () =>
        this.getStatus(
          (m) => !!m.orientation && this.isStandardOrientation(m.orientation)
        )
    ),
    new ScoreCardMetric(
      "Contains <a href='https://developer.mozilla.org/en-US/docs/Web/Manifest/screenshots'>screenshots</a> for app store listings",
      2,
      "recommended",
      () => this.getStatus((m) => !!m.screenshots && m.screenshots.length > 0)
    ),
    new ScoreCardMetric(
      "Has a square PNG icon 512x512 or larger",
      2,
      "recommended",
      () =>
        this.getStatus(
          (m) => !!findSuitableIcon(m.icons, "any", 512, 512, "image/png")
        )
    ),
    new ScoreCardMetric(
      "Has a <a target='_blank' rel='noopener' href='https://web.dev/maskable-icon/'>maskable</a> PNG icon",
      2,
      "recommended",
      () =>
        this.getStatus(
          (m) => !!findSuitableIcon(m.icons, "maskable", 32, 32, "image/png")
        )
    ),
    new ScoreCardMetric(
      "Contains <a href='https://developer.mozilla.org/en-US/docs/Web/Manifest/categories'>categories</a> to classify the app",
      2,
      "recommended",
      () =>
        this.getStatus(
          (m) =>
            !!m.categories &&
            m.categories.length > 0 &&
            this.containsStandardCategory(m.categories)
        )
    ),
    new ScoreCardMetric(
      "Lists <a href='https://components.pwabuilder.com/demo/web_shortcuts'>shortcuts</a> for quick access",
      2,
      "recommended",
      () => this.getStatus((m) => !!m.shortcuts && m.shortcuts.length > 0)
    ),
    new ScoreCardMetric(
      "Contains an <a href='https://www.w3.org/TR/manifest-app-info/#iarc_rating_id-member'>IARC rating ID</a> to determine the appropriate ages for the app",
      1,
      "optional",
      () => this.getStatus((m) => !!m.iarc_rating_id)
    ),
    new ScoreCardMetric(
      "Specifies <a href='https://web.dev/get-installed-related-apps/'>related_applications</a> and <a href='https://developer.mozilla.org/en-US/docs/Web/Manifest/prefer_related_applications'>prefer_related_applications</a> for coordination with a native app",
      1,
      "optional",
      () =>
        this.getStatus(
          (m) =>
            !!m.related_applications &&
            m.related_applications.length > 0 &&
            m.prefer_related_applications !== undefined
        )
    ),
  ];

  created() {
    this.findManifest();
  }

  get editManifestContent(): string {
    if (!this.manifestLoadFinished) {
      return "";
    }

    if (!this.manifest || this.noManifest) {
      return `<i class="fas fa-exclamation-circle"></i> We couldn't detect a web manifest.
              <a href='https://developer.mozilla.org/en-US/docs/Web/Manifest'>Learn more about manifests</a>, or&nbsp;`;
    }

    return "";
  }

  get editManifestLinkContent(): string {
    if (!this.manifestLoadFinished) {
      return "";
    }

    if (!this.manifest || this.noManifest) {
      return `<i class="fas fa-magic"></i> create a new one`;
    }

    if (this.manifest) {
      return `<i class='far fa-edit'></i> Edit your manifest`;
    }

    return "";
  }

  async findManifest(): Promise<void> {
    const cachedData: ManifestContext | null = getCache("manifest", this.url);
    if (cachedData) {
      this.manifest = cachedData;
    } else {
      try {
        this.manifest = await this.getManifestInformation();
      } catch (manifestFetchError) {
        this.manifest = null;
      }
    }

    // If the manifest is generated by PWABuilder, for scoring purposes act as though there is no manifest.
    this.noManifest = !this.manifest || !!this.manifest.generated;
    if (this.manifest && !this.noManifest) {
      try {
        await this.updateCaches(this.manifest);
      } catch (updateCachesError) {
        console.warn(
          "Manifest fetch succeeded, however, updating caches failed: " +
            updateCachesError
        );
      }
    }

    this.manifestLoadFinished = true;
  }

  private async updateCaches(manifest: ManifestContext) {
    this.updateManifest(manifest);
    await setCache("manifest", this.url, manifest);
  }

  private getStatus(
    manifestCheck: (manifest: Manifest) => boolean
  ): ScoreCardMetricStatus {
    if (this.noManifest) {
      return "missing";
    }
    if (!this.manifest) {
      return "loading";
    }

    return manifestCheck(this.manifest) ? "present" : "missing";
  }

  private containsStandardCategory(categories: string[]): boolean {
    // https://github.com/w3c/manifest/wiki/Categories
    const standardCategories = [
      "books",
      "business",
      "education",
      "entertainment",
      "finance",
      "fitness",
      "food",
      "games",
      "government",
      "health",
      "kids",
      "lifestyle",
      "magazines",
      "medical",
      "music",
      "navigation",
      "news",
      "personalization",
      "photo",
      "politics",
      "productivity",
      "security",
      "shopping",
      "social",
      "sports",
      "travel",
      "utilities",
      "weather",
    ];

    return categories.some((c) => standardCategories.includes(c));
  }

  private isStandardOrientation(orientation: string) {
    const standardOrientations = [
      "any",
      "natural",
      "landscape",
      "landscape-primary",
      "landscape-secondary",
      "portrait",
      "portrait-primary",
      "portrait-secondary",
    ];
    return standardOrientations.includes(orientation);
  }
}
</script>
