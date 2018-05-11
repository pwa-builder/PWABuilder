import { MutationTree } from 'vuex';
import { State, Sample, types } from '~/store/modules/windows';


export const mutations: MutationTree<State> = {
  [types.UPDATE_SAMPLES](state, data: Array<Sample>): void {
    state.samples = data;
  },
  [types.UPDATE_SAMPLE](state, payload): void {
    payload.sample.source = payload.source;  
    state.sample = payload.sample; 
  },
  [types.RESET_STATES](state): void {
    state.samples = [];
  }
};