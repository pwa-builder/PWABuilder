import { ActionContext } from 'vuex';
import { RootState, modules } from 'store';

export let actionContextMockBuilder = <S>(state: S): ActionContext<S, RootState> => ({
    dispatch: (type: string) => Promise.resolve(),
    commit: (type: string) => {},
    state: state,
    getters: {},
    rootState: modules,
    rootGetters: {}
});