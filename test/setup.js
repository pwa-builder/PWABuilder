let customEnv = require('../environments/test');

// Configure environment variables for tests
process.env = { ...process.env, ...customEnv };