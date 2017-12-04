import { ActionTree, MutationTree, GetterTree } from 'vuex';
import { RootState } from 'store';

const apiUrl = `${process.env.apiUrl}/manifests`;

export const name = 'generator';

export const types = {
    UPDATE_LINK: 'UPDATE_LINK',
    UPDATE_WITH_MANIFEST: 'UPDATE_WITH_MANIFEST',
    SET_DEFAULTS_MANIFEST: 'SET_DEFAULTS_MANIFEST'
};

export interface Manifest {
    background_color: string | null;
    description: string | null;
    dir: string | null;
    display: string,
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

export interface State {
    url: string | null;
    manifest: Manifest | null;
    manifestId: string | null;
    siteServiceWorkers: any;
    icons: string[];
    suggestions: string[] | null;
    warnings: string[] | null;
    errors: string [] | null;
}

export const state = (): State => ({
    url: null,
    manifest: null,
    manifestId: null,
    siteServiceWorkers: null,
    icons: [],
    suggestions: null,
    warnings: null,
    errors: null
});

export const getters: GetterTree<State, RootState> = {};

export const actions: ActionTree<State, RootState> = {
    updateLink({ commit }, url: string) {
        commit(types.UPDATE_LINK, url);
    },

    async generate({ commit, state }) {
        const options = {
            siteUrl: state.url
        };

        const result = await this.$axios.$post(apiUrl, options);
        commit(types.UPDATE_WITH_MANIFEST, result)
        commit(types.SET_DEFAULTS_MANIFEST)
    }
};

export const mutations: MutationTree<State> = {
    [types.UPDATE_LINK](state, url: string): void {
        state.url = url;
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

