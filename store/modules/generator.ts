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
    SET_DEFAULTS_MANIFEST: 'SET_DEFAULTS_MANIFEST'
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

export interface State {
    url: string | null;
    error: string | null;
    manifest: Manifest | null;
    manifestId: string | null;
    siteServiceWorkers: any;
    icons: string[];
    suggestions: string[] | null;
    warnings: string[] | null;
    errors: string[] | null;
    languages: StaticContent[] | null;
    displays: StaticContent[] | null;
    orientations: StaticContent[] | null;
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
    errors: null,
    languages: null,
    displays: null,
    orientations: null
});

export const getters: GetterTree<State, RootState> = {};

export interface Actions<S, R> extends ActionTree<S, R> {
    nuxtServerInit(context: ActionContext<S, R>): void;
    updateLink(context: ActionContext<S, R>, url: string): void;
    getManifestInformation(context: ActionContext<S, R>): void;
}

export const actions: Actions<State, RootState> = {
    async nuxtServerInit({ commit }): Promise<void> {
        try {
            commit(types.SET_LANGUAGES, await this.$axios.$get('/languages.json'));
            commit(types.SET_DISPLAYS, await this.$axios.$get('/displays.json'));
            commit(types.SET_ORIENTATIONS, await this.$axios.$get('/orientations.json'));
        } catch (e) {
            throw e;
        }
    },

    updateLink({ commit }, url: string): void {
        if (url && !url.startsWith('http') && !url.startsWith('http')) {
            url = 'https://' + url;
        }

        if (!isValidUrl(url)) {
            commit(types.UPDATE_ERROR, 'Please provide a URL.');
            return;
          }

        commit(types.UPDATE_LINK, url);
    },

    async getManifestInformation({ commit, state }): Promise<{}> {
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
                commit(types.SET_DEFAULTS_MANIFEST);
    
                resolve();
            } catch (e) {
                commit(types.UPDATE_ERROR, e.response.data.error || e.response.data || e.response.statusText);
            }
        });
    }
};

export const mutations: MutationTree<State> = {
    [types.SET_LANGUAGES](state, languages: StaticContent[]): void {
        state.languages = languages;
    },

    [types.SET_DISPLAYS](state, displays: StaticContent[]): void {
        state.displays = displays;
    },

    [types.SET_ORIENTATIONS](state, orientations: StaticContent[]): void {
        state.orientations = orientations;
    },

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
        state.icons = result.icons || [];
        state.suggestions = result.suggestions;
        state.warnings = result.warnings;
        state.errors = result.errors;
    },

    [types.SET_DEFAULTS_MANIFEST](state): void {
        if (!state.manifest) {
            return;
        }

        state.manifest.lang = state.manifest.lang || '';
        state.manifest.display = state.manifest.display || 'fullscreen';
        state.manifest.orientation = state.manifest.orientation || 'any';
    }
};

