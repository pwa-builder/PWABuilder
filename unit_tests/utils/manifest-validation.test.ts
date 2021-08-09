import expect from 'expect';
import { validateScreenshotUrlsList } from '../../src/script/utils/manifest-validation';

describe('utils/manifest-validation', () => {
  it('validateScreenshotUrlsList() - happy', () => {
    const output = validateScreenshotUrlsList([
      'www.pwabuilder.com',
      'www.msn.com',
    ]);
    expect(output).toStrictEqual([true, true]);
  });

  it('validateScreenshotUrlsList() - single valid', () => {
    const output = validateScreenshotUrlsList(['www.pwabuilder.com']);
    expect(output).toStrictEqual([true]);
  });

  it('validateScreenshotUrlsList() - empty list', () => {
    const output = validateScreenshotUrlsList([]);
    expect(output).toStrictEqual([]);
  });

  it('validateScreenshotUrlsList() - undefined in list', () => {
    const output = validateScreenshotUrlsList([undefined]);
    expect(output).toStrictEqual([false]);
  });

  it('validateScreenshotUrlsList() - mixed', () => {
    const output = validateScreenshotUrlsList([
      'www.pwabuilder.com',
      undefined,
    ]);
    expect(output).toStrictEqual([true, false]);
  });
});
