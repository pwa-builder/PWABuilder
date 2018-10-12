import { MutationTree } from 'vuex';
import { State, ServiceWorker, types } from '~/store/modules/serviceworker';

export const mutations: MutationTree<State> = {
    [types.UPDATE_SERVICEWORKERS](state, serviceworkers: Array<ServiceWorker>): void {
        state.serviceworkers = serviceworkers;
    },
    [types.UPDATE_ARCHIVE](state, archive: string): void {
        state.archive = archive;
    },
    [types.UPDATE_SERVICEWORKER](state, serviceworker: number): void {
        state.serviceworker = serviceworker;
    },
    [types.UPDATE_SERVICEWORKERPREVIEW](state, code: string): void {
        state.serviceworkerPreview = code;
    },
    [types.UPDATE_WEBPREVIEW](state, code: string): void {
        state.webPreview = code;
    },
    [types.RESET_STATES](state): void {
        state.archive = null;
        state.serviceworker = 1;
    }
};