import { GetterTree } from 'vuex';
import { RootState } from 'store';
import { State, helpers } from '~/store/modules/generator';

export const getters: GetterTree<State, RootState> = {
    suggestionsTotal: (state: State): number => {
        return helpers.sumIssues(state.suggestions);

    },

    warningsTotal: (state: State): number => {
        return helpers.sumIssues(state.warnings);
    }
};