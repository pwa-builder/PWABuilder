import { ActionContext } from 'vuex';
import { RootState, modules, state } from 'store';

const modulesStates = {
    generator: modules.generator.state(),
    serviceworker: modules.serviceworker.state(),
    publish: modules.publish.state(),
    i18n: modules.i18n.state()
};

export let actionContextMockBuilder = <S>(s: S): ActionContext<S, RootState> => ({
    dispatch: (type: string) => Promise.resolve(),
    commit: (type: string) => {},
    state: s,
    getters: {},
    rootState: {...modulesStates, ...state()},
    rootGetters: {}
});