import { ActionTree, ActionContext } from "vuex";
import {
  Manifest,
  ManifestContext,
  Icon,
  RelatedApplication,
  CustomMember,
  ColorOptions,
  types,
  helpers,
  State,
} from "~/store/modules/generator";
import { RootState } from "store";
import { ManifestFetcher } from "~/utils/manifest-fetcher";

const screenshotsUrl = `${process.env.screenshotsUrl}`;

export interface Actions<S, R> extends ActionTree<S, R> {
  update(context: ActionContext<S, R>): void;
  updateManifest(context: ActionContext<S, R>, manifest: ManifestContext): void;
  updateLinkFromStorage(context: ActionContext<S, R>, url: string): void;
  updateLink(context: ActionContext<S, R>, url: string): void;
  getManifestInformation(context: ActionContext<S, R>): Promise<Manifest>;
  removeIcon(context: ActionContext<S, R>, icon: Icon): void;
  resetStates(context: ActionContext<S, R>): void;
  addIconFromUrl(context: ActionContext<S, R>, newIconSrc: string): void;
  addScreenshotsFromUrl(
    context: ActionContext<S, R>,
    urls: string[]
  ): Promise<void>;
  uploadIcon(context: ActionContext<S, R>, iconFile: File): void;
  generateMissingImages(context: ActionContext<S, R>, iconFile: File): void;
  addRelatedApplication(
    context: ActionContext<S, R>,
    payload: RelatedApplication
  ): void;
  removeRelatedApplication(context: ActionContext<S, R>, id: string): void;
  changePreferRelatedApplication(
    context: ActionContext<S, R>,
    status: boolean
  ): void;
  addCustomMember(context: ActionContext<S, R>, payload: CustomMember): void;
  removeCustomMember(context: ActionContext<S, R>, name: string): void;
  updateColor(context: ActionContext<S, R>, payload: ColorOptions): void;
}

export const actions: Actions<State, RootState> = {
  async update({ commit, state, rootState }): Promise<void> {
    console.log("update", state);

    if (!state.manifestId) {
      if (state.manifest && rootState.generator.manifest) {
        // Fix common issues with the manifest
        if (typeof state.manifest.related_applications === "string") {
          state.manifest.related_applications = [];
          rootState.generator.manifest.related_applications = [];
        }

        if (state.manifest.generated) {
          delete state.manifest.generated;
          delete rootState.generator.manifest.generated;
        }
      }

      // Create
      await new ManifestFetcher(state.url!, this.$axios).fetch();
    }

    commit(types.UPDATE_WITH_MANIFEST, {
      format: "w3c",
      content: state.manifest,
      id: "not-used",
      generatedUrl: state.manifest ? state.manifest.manifestUrl : null,
      errors: [],
      suggestions: [],
      warnings: [],
    });
    commit(types.SET_DEFAULTS_MANIFEST, {
      displays: rootState.displays ? rootState.displays[0].name : "",
      orientations: rootState.orientations
        ? rootState.orientations[0].name
        : "",
    });
  },

  updateManifest({ commit, dispatch }, manifest): void {
    commit(types.UPDATE_MANIFEST, manifest);
    dispatch("update");
  },

  commitManifest({ commit }, manifest): void {
    commit(types.UPDATE_MANIFEST, manifest);
  },

  updateLinkFromStorage({ commit }, url: string): void {
    commit(types.UPDATE_LINK, url);
  },

  async updateLink({ commit }, url: string): Promise<any> {
    if (url && !url.startsWith("http")) {
      url = "https://" + url;
    }

    const test = await helpers.isValidUrl(url);

    if (
      test.message !== undefined &&
      !url.toLowerCase().startsWith("http://")
    ) {
      throw `${
        test.message
      }: this error means that you may have a bad https cert or the url may not be correct`;
    }

    commit(types.UPDATE_LINK, url);
  },

  async getManifestInformation({
    commit,
    state,
    rootState,
  }): Promise<ManifestContext> {
    if (!state.url) {
      throw "error.url_empty";
    }
    if (state.manifest && state.manifest.url === state.url) {
      return state.manifest;
    }

    try {
      const manifest = state.manifest;

      if (manifest && rootState.generator.manifest) {
        // Fix common issues with the manifest
        if (typeof manifest.related_applications === "string") {
          manifest.related_applications = [];
          rootState.generator.manifest.related_applications = [];
        }

        if (manifest.generated) {
          delete manifest.generated;
          delete rootState.generator.manifest.generated;
        }
      }

      // Grab the manifest.
      const manifestFetcher = new ManifestFetcher(state.url, this.$axios);
      const result = await manifestFetcher.fetch();

      // Convert color if necessary
      result.content.background_color = helpers.fixColorFromServer(
        result.content.background_color
      );

      // Fix common issues with the manifest
      if (typeof result.content.related_applications === "string") {
        result.content.related_applications = [];
      }

      if (result.content.generated) {
        delete result.content.generated;
      }

      result.content.url = state.url;

      result.content["manifestUrl"] = result.generatedUrl;

      commit(types.UPDATE_WITH_MANIFEST, result);
      commit(types.SET_DEFAULTS_MANIFEST, {
        displays: rootState.displays ? rootState.displays[0].name : "",
        orientations: rootState.orientations
          ? rootState.orientations[0].name
          : "",
      });

      return result.content as ManifestContext;
    } catch (e) {
      if (e.response && e.response.data) {
        let errorMessage = e.response.data
          ? e.response.data.error
          : e.response.data || e.response.statusText;
        throw new Error(errorMessage);
      }

      throw e;
    }
  },

  removeIcon({ commit, state, dispatch }, icon: Icon): void {
    let icons = [...state.icons];
    const index = icons.findIndex((i) => {
      return i.src === icon.src;
    });

    if (index > -1) {
      icons.splice(index, 1);
      commit(types.UPDATE_ICONS, icons);
    }
    dispatch("update", { root: true });
  },

  removeScreenshot({ commit, state, dispatch }, screenshot: Icon): void {
    let screenshots = [...state.screenshots];
    const index = screenshots.findIndex((i) => {
      return i.src === screenshot.src;
    });

    if (index > -1) {
      screenshots.splice(index, 1);
      commit(types.UPDATE_SCREENSHOTS, screenshots);
    }
    dispatch("update", { root: true });
  },

  resetStates({ commit }): void {
    commit(types.RESET_STATES);
  },

  async addIconFromUrl(
    { commit, state, dispatch },
    newIconSrc: string
  ): Promise<void> {
    let src = newIconSrc;

    if (!src) {
      return;
    }

    if (src.charAt(0) === "/") {
      src = src.slice(1);
    }

    if (!src.includes("http")) {
      let prefix = state.manifest ? state.manifest.start_url : state.url;
      src = (prefix || "") + src;
    }

    try {
      const sizes = await helpers.getImageIconSize(src);
      commit(types.ADD_ICON, { src, sizes: `${sizes.width}x${sizes.height}` });
      dispatch("update");
    } catch (e) {
      throw e;
    }
  },

  async uploadIcon({ commit, dispatch, state }, iconFile: File): Promise<void> {
    console.log("uploadIcon", iconFile, state);

    const dataUri: string = await helpers.getImageDataURI(iconFile);
    const sizes = await helpers.getImageIconSize(dataUri);
    commit(types.ADD_ICON, {
      src: dataUri,
      sizes: `${sizes.width}x${sizes.height}`,
      fileName: iconFile.name,
    });

    dispatch("update");
  },

  async isValidUrls({}, urls: string[]) {
    var invalidUrls: string[] = [];
    for (var i = 0; i < urls.length; i++) {
      const test = await helpers.isValidScreenshotUrl(urls[i]);
      if (!test) invalidUrls.push(urls[i]);
    }
    console.log(invalidUrls);
    return invalidUrls;
  },

  async addScreenshotsFromUrl(
    { commit, state, dispatch },
    urls: string[]
  ): Promise<void> {
    //fetch screenshots from each URL
    // receive screenshots and add src to manifest

    try {
      const res = await fetch(screenshotsUrl + "/screenshotsAsBase64Strings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: urls,
        }),
      });

      if (res.ok) {
        interface ScreenshotsAsBase64StringsInterface {
          images: Array<Icon>;
        }

        const response: ScreenshotsAsBase64StringsInterface = await res.json();
        console.log(response);

        console.log("Result", res, response, state);
        response.images.forEach((img) => {
          img.src = "data:" + (img.type || "image/png") + ";base64," + img.src;
        });

        commit(types.ADD_SCREENSHOT, response.images);
        commit(types.UPDATE_MANIFEST_PARTIAL, {
          screenshots: state.screenshots,
        });
        dispatch("update");
      } else {
        throw "screenshot service error";
      }
    } catch (e) {
      console.error(e);
    }
  },
  async generateMissingImages(
    { commit, state, dispatch },
    iconFile: File
  ): Promise<void> {
    console.log("generateMissingImages", state, iconFile);

    let result = {
      assets: undefined,
    };

    console.log(iconFile, commit, dispatch, result);
    try {
      // result = await fetch("", {});
    } catch (e) {
      console.error(e);
    }

    // commit(types.OVERWRITE_MANIFEST, result);
    // commit(types.ADD_ASSETS, result.assets);
    // dispatch("update");
  },

  addRelatedApplication(
    { commit, dispatch },
    payload: RelatedApplication
  ): void {
    const errors = helpers.hasRelatedApplicationErrors(payload);

    if (errors) {
      throw errors;
    }

    commit(types.ADD_RELATED_APPLICATION, payload);
    dispatch("update");
  },

  removeRelatedApplication({ commit, dispatch }, id: string): void {
    commit(types.REMOVE_RELATED_APPLICATION, id);
    dispatch("update");
  },

  // @ts-ignore TS6133
  changePreferRelatedApplication({ commit, dispatch }, status: boolean): void {
    commit(types.UPDATE_PREFER_RELATED_APPLICATION, status);
    dispatch("update");
  },

  addCustomMember({ commit, state, dispatch }, payload: CustomMember): void {
    if (state.members.find((member) => member.name === payload.name)) {
      throw "error.custom_value";
    }

    if (!payload.name.includes("_")) {
      payload.name = helpers.MEMBER_PREFIX + payload.name;
    }

    try {
      payload.value = JSON.parse(payload.value);
      commit(types.ADD_CUSTOM_MEMBER, payload);
      dispatch("update");
    } catch (e) {
      throw "error.parsing_value";
    }
  },

  removeCustomMember({ commit, dispatch }, name: string): void {
    commit(types.REMOVE_CUSTOM_MEMBER, name);
    dispatch("update");
  },

  updateColor({ commit, dispatch }, payload: ColorOptions): void {
    let color = payload.colorOption;

    if (color === helpers.COLOR_OPTIONS.pick) {
      color = payload.color;
    }

    commit(types.UPDATE_COLOR, color);
    dispatch("update");
  },
};
