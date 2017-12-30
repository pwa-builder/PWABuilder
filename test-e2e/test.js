const env = require(`../environments/${process.env.NODE_ENV}`)

module.exports = {
    beforeEach: browser => {
      browser
        .url(env.baseUrl)
        .waitForElementVisible('.container', 1000);
    },
    'Smoke test': browser => {
      browser
        .assert.visible('#siteUrl', 'Check if website input exist')
        .assert.value('#siteUrl', '')
        .click('.get-started.pwa-button.isEnabled.next-step')
        .pause(1000)
        .assert.visible('.l-generator-error')
        .assert.containsText('.l-generator-error', 'Please provide a URL.');
    },
    after: browser => browser.end(),
  };