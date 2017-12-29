import { GetterTree, ActionContext, ActionTree, MutationTree } from 'vuex';
import { RootState } from 'store';

export const types = {
    SET_LANGUAGES: 'SET_LANGUAGES',
    SET_DISPLAYS: 'SET_DISPLAYS',
    SET_ORIENTATIONS: 'SET_ORIENTATIONS'
};

export interface StaticContent {
    code: string;
    name: string;
}

export interface State {
    languages: StaticContent[] | null;
    displays: StaticContent[] | null;
    orientations: StaticContent[] | null;
}

export const state = (): any => ({
    languages: null,
    displays: null,
    orientations: null
});

export const helpers = {
    getStaticContentNames(collection: StaticContent[] | null): string[] {
        if (!collection) {
            return [];
        }
    
        return collection.map(x => x.name);
    }
};

export const getters: GetterTree<State, RootState> = {
    languagesNames(state: State): string[] {
        return helpers.getStaticContentNames(state.languages);
    },

    displaysNames(state: State): string[] {
        return helpers.getStaticContentNames(state.displays);
    },

    orientationsNames(state: State): string[] {
        return helpers.getStaticContentNames(state.orientations);
    }
};


export interface Actions<S, R> extends ActionTree<S, R> {
    nuxtServerInit(context: ActionContext<S, R>): void;
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
    }
};


