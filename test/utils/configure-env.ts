let customVariables = require('../../environments/test');

export let configureEnv = () => ({...process.env, ...customVariables});