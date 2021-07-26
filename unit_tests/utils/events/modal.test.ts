import { expect } from 'chai';

import { AppModalCloseEvent } from '../../../src/script/utils/events/modal';

describe('utils/events/modal', () => {
  it('construct AppModalCloseEvent()', () => {
    const event = AppModalCloseEvent('test');

    expect(event.detail.modalId).to.equal('test');
  });
});
