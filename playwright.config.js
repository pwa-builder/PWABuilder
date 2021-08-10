const os = require("os")

module.exports = {
  // Each test is given 60 seconds
  timeout: 60000,

  // Forbid test.only on CI
  forbidOnly: !!process.env.CI,

  // Two retries for each test
  // This is good for our tests as each action can be long-running
  // as we are waiting on network requests.
  // This way we avoid false positives
  retries: 2,

  // Limit the number of workers on CI, use number of cores - 1 locally
  workers: process.env.CI ? 2 : os.cpus().length - 1,

  // Set the directory for the integration tests
  testDir: "tests/"

};
