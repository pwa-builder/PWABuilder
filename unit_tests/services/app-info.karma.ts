import { expect } from 'chai';

import { baseOrPublish } from '../../src/script/services/app-info';

describe('services/app-info', () => {
  it('baseOrPublish() - returns base if choseSW is undefined', () => {
    expect(baseOrPublish()).to.equal('base');
  });
});
