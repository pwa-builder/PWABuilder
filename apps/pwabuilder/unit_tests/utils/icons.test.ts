import { expect } from 'chai';

import { Icon } from '../../src/script/utils/interfaces';
import { findSuitableIcon } from '../../src/script/utils/icons';

describe('utils/icons', () => {
  const mockList: Array<Icon> = [
    {
      src: 'https://pwabuilder.com/Images/assets/newIcons/icon_512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: 'https://pwabuilder.com/Images/assets/newIcons/icon_190.png',
      sizes: '256x256',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: 'https://pwabuilder.com/Images/assets/newIcons/icon_120.png',
      sizes: '128x128',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: 'https://pwabuilder.com/Images/assets/newIcons/icon_60.png',
      sizes: '64x64',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: 'https://pwabuilder.com/Images/assets/newIcons/icon_57.png',
      sizes: '48x48',
      type: 'image/png',
      purpose: 'any',
    },
  ];

  it('findSuitableIcon() happy path', () => {
    const icon = findSuitableIcon(mockList, 'any', 512, 512, 'image/png');

    expect(icon!.sizes).to.equal('512x512');
  });

  it('findSuitableIcon() without purpose', () => {
    const list: Array<Icon> = [...mockList];
    if (list[0]) {
      list[0].purpose = undefined;
    }

    const icon = findSuitableIcon(list, 'any', 512, 512, 'image/png');

    expect(icon!.sizes).to.equal('512x512');
  });

  it('findSuitableIcon() will find the largest if size not found', () => {
    const icon = findSuitableIcon(mockList, 'any', 16, 16, 'image/png');

    expect(icon!.sizes).to.equal('512x512');
  });

  it('findSuitableIcon() no suitable', () => {
    expect(findSuitableIcon(mockList, 'any', 1920, 1600, 'image/jpeg')).to.be
      .null;
  });

  it('findSuitableIcon() given empty list returns null', () => {
    expect(findSuitableIcon([], 'any', 1920, 1600, 'image/jpeg')).to.be.null;
  });

  it('findSuitableIcon() given null returns null', () => {
    expect(findSuitableIcon(null, 'any', 1920, 1600, 'image/jpeg')).to.be.null;
  });

  it('findSuitableIcon() given undefined returns null', () => {
    expect(findSuitableIcon(undefined, 'any', 1920, 1600, 'image/jpeg')).to.be
      .null;
  });
});
