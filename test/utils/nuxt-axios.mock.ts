import axios from 'axios';

export let nuxtAxiosMockBuilder = actions => {
    let mockActions = {...actions};
    mockActions.$axios = axios;
    mockActions.$axios.$post = axios.post;
    mockActions.$axios.$get = axios.get;

    return mockActions;
};