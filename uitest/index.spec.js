const { expect } = require('chai');
const puppeteer = require('puppeteer');

let browser;
let page;

before(async () => {
  browser = await puppeteer.launch({
    headless: false
  });

  page = await browser.newPage();
  await page.goto('https://pwabuilder-site-prod-staging.azurewebsites.net');
});

beforeEach(async () => {
  await page.goto('https://pwabuilder-site-prod-staging.azurewebsites.net');
  await page.reload();
})

after(() => {
  browser.close();
});

describe('report card page', () => {
  it('should test a site', async () => {
    await page.waitFor('#getStartedInput');

    await page.click('#getStartedInput');
    
    await page.type('#getStartedInput', 'https://webboard.app');

    await page.click('#getStartedButton');

    await page.waitFor('#overallScore');

    expect(await page.$eval('#overallScore', el => el)).to.exist;
  });

  it('should fail a bad URL', async () => {
    await page.waitFor('#getStartedInput');

    await page.click('#getStartedInput');
    
    await page.type('#getStartedInput', 'https://self-signed.badssl.com/');

    await page.click('#getStartedButton');

    await page.waitFor('#overallScore');

    expect(await page.$eval('.brkManifestError', el => el)).to.exist;
  });
});

describe('features page', () => {
  it('should load the features page', async () => {
    await page.waitFor('#getStartedInput');

    await page.goto('https://pwabuilder-site-prod-staging.azurewebsites.net/features');

    await page.waitFor('#featurePageHeader');

    expect(await page.$eval('#featureListBlock', el => el)).to.exist;
  })
});