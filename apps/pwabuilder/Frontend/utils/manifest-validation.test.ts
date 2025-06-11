import { expect } from 'chai';
import { validateScreenshotUrlsList } from '../../src/script/utils/manifest-validation';

describe('utils/manifest-validation', () => {
  it('validateScreenshotUrlsList() - happy', () => {
    const output = validateScreenshotUrlsList([
      'www.pwabuilder.com',
      'www.msn.com',
    ]);
    expect(output).to.deep.equal([true, true]);
  });

  it('validateScreenshotUrlsList() - single valid', () => {
    const output = validateScreenshotUrlsList(['www.pwabuilder.com']);
    expect(output).to.deep.equal([true]);
  });

  it('validateScreenshotUrlsList() - empty list', () => {
    const output = validateScreenshotUrlsList([]);
    expect(output).to.deep.equal([]);
  });

  it('validateScreenshotUrlsList() - undefined in list', () => {
    const output = validateScreenshotUrlsList([undefined]);
    expect(output).to.deep.equal([false]);
  });

  it('validateScreenshotUrlsList() - mixed', () => {
    const output = validateScreenshotUrlsList([
      'www.pwabuilder.com',
      undefined,
    ]);
    expect(output).to.deep.equal([true, false]);
  });
});
