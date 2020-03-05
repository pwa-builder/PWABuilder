import { ActionTree, ActionContext } from 'vuex';
import { Manifest, Icon, RelatedApplication, CustomMember, ColorOptions, types, helpers, State } from '~/store/modules/generator';
import { RootState } from 'store';

const apiUrl = `${process.env.apiUrl}/manifests`;

export interface Actions<S, R> extends ActionTree<S, R> {
  update(context: ActionContext<S, R>): void;
  updateManifest(context: ActionContext<S, R>, manifest: Manifest): void;
  updateLink(context: ActionContext<S, R>, url: string): void;
  getManifestInformation(context: ActionContext<S, R>): Promise<void>;
  removeIcon(context: ActionContext<S, R>, icon: Icon): void;
  resetStates(context: ActionContext<S, R>): void;
  addIconFromUrl(context: ActionContext<S, R>, newIconSrc: string): void;
  uploadIcon(context: ActionContext<S, R>, iconFile: File): void;
  generateMissingImages(context: ActionContext<S, R>, iconFile: File): void;
  addRelatedApplication(context: ActionContext<S, R>, payload: RelatedApplication): void;
  removeRelatedApplication(context: ActionContext<S, R>, id: string): void;
  changePreferRelatedApplication(context: ActionContext<S, R>, status: boolean): void;
  addCustomMember(context: ActionContext<S, R>, payload: CustomMember): void;
  removeCustomMember(context: ActionContext<S, R>, name: string): void;
  updateColor(context: ActionContext<S, R>, payload: ColorOptions): void;
}

export const actions: Actions<State, RootState> = {
  async update({ commit, state, rootState }): Promise<void> {
    if (!state.manifestId) {
      

      if (state.manifest && rootState.generator.manifest) {
        // Fix common issues with the manifest
        if (typeof (state.manifest.related_applications) === 'string') {
          state.manifest.related_applications = [];
          rootState.generator.manifest.related_applications = [];
        }

        if (state.manifest.generated) {
          delete state.manifest.generated;
          delete rootState.generator.manifest.generated;
        }
      }

      // Create
      await this.$axios.$post(apiUrl, { siteUrl: state.url });
    }

    // Update
    const customManifest: any = Object.assign({}, state.manifest);
    state.members.forEach(member => {
      customManifest[member.name] = member.value;
    });

    customManifest["icons"] = [];

    state.icons.forEach(icon => {
      customManifest["icons"].push(Object.assign({}, icon));
    });

    customManifest["screenshots"] = [];

    state.screenshots.forEach(icon => {
      customManifest["screenshots"].push(Object.assign({}, icon));
    });


    if (typeof (customManifest.related_applications) === 'string') {
      customManifest.related_applications = [];
    }

    if (customManifest.generated) {
      delete customManifest.generated;
    }


    const result = await this.$axios.$put(`${apiUrl}/${state.manifestId}`, customManifest);

    commit(types.UPDATE_WITH_MANIFEST, result);
    commit(types.SET_DEFAULTS_MANIFEST, {
      displays: rootState.displays ? rootState.displays[0].name : '',
      orientations: rootState.orientations ? rootState.orientations[0].name : ''
    });
  },

  updateManifest({ commit, dispatch }, manifest): void {
    commit(types.UPDATE_MANIFEST, manifest);
    dispatch('update');
  },

  commitManifest({ commit }, manifest): void {
    commit(types.UPDATE_MANIFEST, manifest);
  },

  async updateLink({ commit }, url: string): Promise<any> {
    if (url && !url.startsWith('http')) {
      url = 'https://' + url;
    }

    const test = await helpers.isValidUrl(url);

    if (test.message !== undefined) {
      throw `${test.message}: this error means that you may have a bad https cert or the url may not be correct`;
    }

    commit(types.UPDATE_LINK, url);
  },

  async getManifestInformation({ commit, state, rootState }): Promise<void> {
    if (!state.url) {
      throw 'error.url_empty';
    }
    if (state.manifest && state.manifest.url === state.url) {
      return;
    }
    const options = {
      siteUrl: state.url
    };

    try {

      const manifest: any = state.manifest;

      if (manifest && rootState.generator.manifest) {
        // Fix common issues with the manifest
        if (typeof (manifest.related_applications) === 'string') {
          manifest.related_applications = [];
          rootState.generator.manifest.related_applications = [];
        }

        if (manifest.generated) {
          delete manifest.generated;
          delete rootState.generator.manifest.generated;
        }
      }

      const result = await this.$axios.$post(apiUrl, options);
      if (!result) {
        throw 'error.Manifest_notFound';
      }
      // Convert color if necessary
      result.background_color = helpers.fixColorFromServer(result.background_color);

      // Fix common issues with the manifest
      if (typeof (result.content.related_applications) === 'string') {
        result.content.related_applications = [];
      }

      if (result.content.generated) {
        delete result.content.generated;
      }

      result.content.url = state.url;

      commit(types.UPDATE_WITH_MANIFEST, result);
      commit(types.SET_DEFAULTS_MANIFEST, {
        displays: rootState.displays ? rootState.displays[0].name : '',
        orientations: rootState.orientations ? rootState.orientations[0].name : ''
      });
      return;
    } catch (e) {
      let errorMessage = e.response.data ? e.response.data.error : e.response.data || e.response.statusText;
      throw errorMessage;
    }
  },

  removeIcon({ commit, state, dispatch }, icon: Icon): void {
    let icons = [...state.icons];
    const index = icons.findIndex(i => {
      return i.src === icon.src;
    });

    if (index > -1) {
      icons.splice(index, 1);
      commit(types.UPDATE_ICONS, icons);
    }
    dispatch('update', { root: true });
  },

  resetStates({ commit }): void {
    commit(types.RESET_STATES);
  },

  async addIconFromUrl({ commit, state, dispatch }, newIconSrc: string): Promise<void> {
    let src = newIconSrc;

    if (!src) {
      return;
    }

    if (src.charAt(0) === '/') {
      src = src.slice(1);
    }

    if (!src.includes('http')) {
      let prefix = state.manifest ? state.manifest.start_url : state.url;
      src = (prefix || '') + src;
    }

    try {
      const sizes = await helpers.getImageIconSize(src);
      commit(types.ADD_ICON, { src, sizes: `${sizes.width}x${sizes.height}` });
      dispatch('update');
    } catch (e) {
      throw e;
    }
  },

  async uploadIcon({ commit, dispatch }, iconFile: File): Promise<void> {
    const dataUri: string = await helpers.getImageDataURI(iconFile);
    const sizes = await helpers.getImageIconSize(dataUri);
    commit(types.ADD_ICON, { src: dataUri, sizes: `${sizes.width}x${sizes.height}` });
    dispatch('update');
  },

  async generateMissingImages({ commit, state, dispatch }, iconFile: File): Promise<void> {
    let formData = new FormData();
    formData.append('file', iconFile);

    const result = await this.$axios.$post(`${apiUrl}/${state.manifestId}/generatemissingimages`, formData);
    commit(types.OVERWRITE_MANIFEST, result);
    commit(types.ADD_ASSETS, result.assets);
    dispatch('update');
  },

  addRelatedApplication({ commit, dispatch }, payload: RelatedApplication): void {
    const errors = helpers.hasRelatedApplicationErrors(payload);

    if (errors) {
      throw errors;
    }

    commit(types.ADD_RELATED_APPLICATION, payload);
    dispatch('update');
  },

  removeRelatedApplication({ commit, dispatch }, id: string): void {
    commit(types.REMOVE_RELATED_APPLICATION, id);
    dispatch('update');
  },

  // @ts-ignore TS6133
  changePreferRelatedApplication({ commit, dispatch }, status: boolean): void {
    commit(types.UPDATE_PREFER_RELATED_APPLICATION, status);
    dispatch('update');
  },

  addCustomMember({ commit, state, dispatch }, payload: CustomMember): void {

    if (state.members.find(member => member.name === payload.name)) {
      throw 'error.custom_value';
    }

    if (!payload.name.includes('_')) {
      payload.name = helpers.MEMBER_PREFIX + payload.name;
    }

    try {
      payload.value = JSON.parse(payload.value);
      commit(types.ADD_CUSTOM_MEMBER, payload);
      dispatch('update');
    } catch (e) {
      throw 'error.parsing_value';
    }
  },

  removeCustomMember({ commit, dispatch }, name: string): void {
    commit(types.REMOVE_CUSTOM_MEMBER, name);
    dispatch('update');
  },

  updateColor({ commit, dispatch }, payload: ColorOptions): void {
    let color = payload.colorOption;

    if (color === helpers.COLOR_OPTIONS.pick) {
      color = payload.color;
    }

    commit(types.UPDATE_COLOR, color);
    dispatch('update');
  }
};