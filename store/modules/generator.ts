import { ActionTree, MutationTree, GetterTree, Action, ActionContext } from 'vuex';
import { RootState } from 'store';

const apiUrl = `${process.env.apiUrl}/manifests`;

const isValidUrl = (siteUrl: string): boolean => {
    return /^(http|https):\/\/[^ "]+$/.test(siteUrl);
};

export const name = 'generator';

export const types = {
    SET_LANGUAGES: 'SET_LANGUAGES',
    SET_DISPLAYS: 'SET_DISPLAYS',
    SET_ORIENTATIONS: 'SET_ORIENTATIONS',
    UPDATE_LINK: 'UPDATE_LINK',
    UPDATE_ERROR: 'UPDATE_ERROR',
    UPDATE_WITH_MANIFEST: 'UPDATE_WITH_MANIFEST',
    SET_DEFAULTS_MANIFEST: 'SET_DEFAULTS_MANIFEST',
    UPDATE_ICONS: 'UPDATE_ICONS',
    RESET: 'RESET'
};

export interface Manifest {
    background_color: string | null;
    description: string | null;
    dir: string | null;
    display: string;
    lang: string | null;
    name: string | null;
    orientation: string | null;
    prefer_related_applications: boolean;
    related_applications: string[];
    scope: string | null;
    short_name: string | null;
    start_url: string | null;
    theme_color: string | null;
}

export interface StaticContent {
    code: string;
    name: string;
}

export interface Icon {
    src: string;
    sizes: string;
}

export interface State {
    url: string | null;
    error: string | null;
    manifest: Manifest | null;
    manifestId: string | null;
    siteServiceWorkers: any;
    icons: Icon[];
    suggestions: string[] | null;
    warnings: string[] | null;
    errors: string[] | null;
}

export const state = (): State => ({
    url: null,
    error: null,
    manifest: null,
    manifestId: null,
    siteServiceWorkers: null,
    icons: [],
    suggestions: null,
    warnings: null,
    errors: null
});

export interface Actions<S, R> extends ActionTree<S, R> {
    updateLink(context: ActionContext<S, R>, url: string): void;
    getManifestInformation(context: ActionContext<S, R>): void;
    removeIcon(context: ActionContext<S, R>, icon: Icon): void;
    reset(context: ActionContext<S, R>): void;
}

export const actions: Actions<State, RootState> = {
    updateLink({ commit }, url: string): void {
        if (url && !url.startsWith('http')) {
            url = 'https://' + url;
        }

        if (!isValidUrl(url)) {
            commit(types.UPDATE_ERROR, 'Please provide a URL.');
            return;
          }

        commit(types.UPDATE_LINK, url);
    },

    async getManifestInformation({ commit, state, rootState }): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            if (!state.url) {
                commit(types.UPDATE_ERROR, 'Url is empty');
                resolve();
            }

            const options = {
                siteUrl: state.url
            };

            try {
                const result = await this.$axios.$post(apiUrl, options);
                commit(types.UPDATE_WITH_MANIFEST, result);
                commit(types.SET_DEFAULTS_MANIFEST, {
                    displays: rootState.displays ? rootState.displays[0].name : '', 
                    orientations: rootState.orientations ? rootState.orientations[0].name : ''
                });
    
                resolve();
            } catch (e) {
                commit(types.UPDATE_ERROR, e.response.data.error || e.response.data || e.response.statusText);
            }
        });
    },

    removeIcon({ commit, state }, icon: Icon): void {
        let icons = [...state.icons];
        const index = icons.findIndex(i => {
            return i.src === icon.src;
        });

        if (index > -1) {
            icons.splice(index, 1);
            console.log(state.icons);
            commit(types.UPDATE_ICONS, icons);
        }
    },

    reset({ commit }): void {
        commit(types.RESET);
    }
};

export const mutations: MutationTree<State> = {
    [types.UPDATE_LINK](state, url: string): void {
        state.url = url;
        state.error = null;
    },

    [types.UPDATE_ERROR](state, error: string): void {
        state.error = error;
    },

    [types.UPDATE_WITH_MANIFEST](state, result): void {
        state.manifest = result.content;
        state.manifestId = result.id;
        state.siteServiceWorkers = result.siteServiceWorkers;
        state.icons = result.content.icons || [];
        state.suggestions = result.suggestions;
        state.warnings = result.warnings;
        state.errors = result.errors;
    },

    [types.SET_DEFAULTS_MANIFEST](state, payload): void {
        if (!state.manifest) {
            return;
        }

        state.manifest.lang = state.manifest.lang || '';
        state.manifest.display = state.manifest.display || payload.defaultDisplay;
        state.manifest.orientation = state.manifest.orientation || payload.defaultOrientation;
    },

    [types.UPDATE_ICONS](state, icons: Icon[]): void {
        state.icons = icons;
    },

    [types.RESET](state): void {
        state.url = null;
        state.error = null;
        state.manifest = null;
        state.manifestId = null;
        state.siteServiceWorkers = null;
        state.icons = [];
        state.suggestions = null;
        state.warnings = null;
        state.errors = null;
    }
};

