import { expect } from 'chai';

import {
  arrayHasChanged,
  objectHasChanged,
} from '../../src/script/utils/hasChanged';

describe('utils/hasChanged', () => {
  it('arrayHasChanged() happy', () => {
    expect(arrayHasChanged<string>(['a'], ['b'])).to.be.true;
  });

  it('arrayHasChanged() both same', () => {
    expect(arrayHasChanged(['a'], ['a'])).to.be.false;
  });

  it('arrayHasChanged() both undefined', () => {
    expect(arrayHasChanged(undefined, undefined)).to.be.false;
  });

  it('objectHasChanged() happy', () => {
    expect(
      objectHasChanged(
        {
          a: true,
        },
        {
          b: true,
        }
      )
    ).to.be.true;
  });

  it('objectHasChanged() same', () => {
    expect(
      objectHasChanged(
        {
          a: true,
        },
        {
          a: true,
        }
      )
    ).to.be.false;
  });

  it('objectHasChanged() both undefined', () => {
    expect(objectHasChanged(undefined, undefined)).to.be.false;
  });
});
