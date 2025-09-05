import { expect } from 'chai';
import {
  isUrl,
  resolveUrl,
  cleanUrl,
  validateUrl,
  isValidURL,
} from '../../src/script/utils/url';

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

  it('validateUrl() returns null on success', () => {
    expect(validateUrl('https://www.pwabuilder.com')).to.be.null;
  });

  it('validateUrl() returns a string on failure', () => {
    expect(validateUrl('asdf', undefined)).to.be.not.null;
  });

  it('cleanUrl() with https succeeds', async () => {
    expect(await cleanUrl('https://www.pwabuilder.com')).to.equal(
      'https://www.pwabuilder.com'
    );
  });

  it('cleanUrl() returns http on http', async () => {
    expect(await cleanUrl('http://www.pwabuilder.com')).to.equal(
      'http://www.pwabuilder.com'
    );
  });

  it('cleanUrl() tries https if protocol is omitted', async () => {
    expect(await cleanUrl('www.pwabuilder.com')).to.equal(
      'https://www.pwabuilder.com'
    );
  });

  it('cleanUrl() ignores http', async () => {
    expect(await cleanUrl('http://www.pwabuilder.com')).to.equal(
      'http://www.pwabuilder.com'
    );
  });

  it('cleanUrl() throws on bad protocol', async () => {
    try {
      await cleanUrl('file://www.pwabuilder.com');
    } catch (e) {
      expect(e.message).to.equal(
        'This error means that you may have a bad https cert or the url may not be correct'
      );
    }
  });

  it('isValidURL() happy path', () => {
    expect(isValidURL('https://www.pwabuilder.com')).to.be.true;
  });

  it('isValidURL() happy path', () => {
    expect(isValidURL('1')).to.be.false;
  });
});
