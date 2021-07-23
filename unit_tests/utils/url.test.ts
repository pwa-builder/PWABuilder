import { expect } from 'chai';
import { isUrl, resolveUrl, cleanUrl } from '../../src/script/utils/url';

describe('utils/url', () => {
  it('isUrl() receives an absolute url', () => {
    expect(isUrl('https://www.pwabuilder.com')).to.equal(true);
  });

  it('isUrl() receive not a url', () => {
    expect(isUrl('a')).to.equal(false);
  });

  it('isUrl() receives a relative url', () => {
    expect(isUrl('www.example.com')).to.equal(false);
  });

  it('resolveUrl() happy path', () => {
    expect(
      resolveUrl('https://www.pwabuilder.com', 'api/awesome')
    ).to.deep.equal(new URL('https://www.pwabuilder.com/api/awesome'));
  });

  it('resolveUrl() no need to resolve', () => {
    expect(
      resolveUrl(
        'https://www.pwabuilder.com',
        'https://www.pwabuilder.com/api/awesome'
      )
    ).to.deep.equal(new URL('https://www.pwabuilder.com/api/awesome'));
  });

  it('resolveUrl() defaults to base url', () => {
    expect(resolveUrl('https://www.pwabuilder.com', undefined)).to.deep.equal(
      new URL('https://www.pwabuilder.com')
    );
  });

  it('todo - validateUrl()', () => {});

  it('cleanurl() with https succeeds', async () => {
    expect(await cleanUrl('https://www.pwabuilder.com')).to.equal(
      'https://www.pwabuilder.com'
    );
  });

  it('cleanurl() throws error on http', async () => {
    expect(await cleanUrl('http://www.pwabuilder.com')).to.throw(
      'This error means that you may have a bad https cert or the url may not be correct'
    );
  });

  // it('cleanurl() tries if protocol is omitted', async () => {
  //   expect(await cleanUrl('www.pwabuilder.com')).to.equal(
  //     'https://www.pwabuilder.com'
  //   );
  // });

  // it('isValidURL()', () => {});
});
