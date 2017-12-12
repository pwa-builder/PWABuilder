import { ActionContext } from 'vuex';
import { RootState, modules } from 'store';
import axios from 'axios';

export let nuxtAxiosMockBuilder = actions => {
    let mockActions = {...actions};
    mockActions.$axios = axios;
    mockActions.$axios.$post = axios.post;

    return mockActions;
};