// test/e2e/simple/simpleTest.js
module.exports = {
    beforeEach: browser => {
      browser
        .url('http://localhost:8000')
        .waitForElementVisible('body')
        .waitForElementVisible('#app > div');
    },
    'Smoke test': browser => {
      browser
        .assert.visible('#app > div', 'Check if app has rendered with   React')
        .assert.title('MyTitle');
    },
    after: browser => browser.end(),
  };