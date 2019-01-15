import { ActionContext } from 'vuex';
import { RootState, modules, state } from 'store';

const modulesStates = {
    generator: modules.generator.state(),
    serviceworker: modules.serviceworker.state(),
    publish: modules.publish.state(),
    i18n: modules.i18n.state(),
    windows: modules.windows.state()
};

export let actionContextMockBuilder = <S>(s: S): ActionContext<S, RootState> => ({
    // @ts-ignore TS6133 type
    dispatch: (type: string) => Promise.resolve(),
    // @ts-ignore TS6133 type
    commit: (type: string) => {},
    state: s,
    getters: {},
    rootState: {...modulesStates, ...state()},
    rootGetters: {}
});