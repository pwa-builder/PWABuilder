import { MutationTree } from 'vuex';
import { State, Snippet, types } from '~/store/modules/windows';


export const mutations: MutationTree<State> = {
  [types.UPDATE_SNIPPETS](state, data: Array<Snippet>): void {
      state.snippets = data;
  },
  [types.UPDATE_SNIPPET](state, data: Snippet): void {
    state.snippet = data;
},
  [types.RESET_STATES](state): void {
    state.snippets = null;
  }
};