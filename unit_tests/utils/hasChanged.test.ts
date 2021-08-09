import expect from 'expect';

import {
  arrayHasChanged,
  objectHasChanged,
} from '../../src/script/utils/hasChanged';

describe('utils/hasChanged', () => {
  it('arrayHasChanged() happy', () => {
    expect(arrayHasChanged<string>(['a'], ['b'])).toBeFalsy();
  });

  it('arrayHasChanged() both same', () => {
    expect(arrayHasChanged(['a'], ['a'])).toBeFalsy();
  });

  it('arrayHasChanged() both undefined', () => {
    expect(arrayHasChanged(undefined, undefined)).toBeFalsy();
  });

  it('arrayHasChanged() both undefined', () => {
    expect(arrayHasChanged(undefined, undefined)).toBeFalsy();
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
    ).toBeTruthy();
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
    ).toBeFalsy();
  });

  it('objectHasChanged() both undefined', () => {
    expect(objectHasChanged(undefined, undefined)).toBeFalsy();
  });
});
