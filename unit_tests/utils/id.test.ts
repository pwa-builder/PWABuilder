import { expect } from 'chai';

import { increment } from '../../src/script/utils/id';

describe('utils/id', () => {
  it('increment() default starts at 0 and steps by 1', () => {
    const inc = increment();

    for (let i = 0; i < 10; i++) {
      expect(inc.next().value).to.equal(i);
    }
  });

  it('increment() default starts at 5 and steps by 5 and ends at 25 (last number is 20)', () => {
    const inc = increment(5, 5, 25);

    expect(inc.next().value).to.equal(5);
    expect(inc.next().value).to.equal(10);
    expect(inc.next().value).to.equal(15);
    expect(inc.next().value).to.equal(20);

    const last = inc.next();
    expect(last.value).to.be.undefined;
    expect(last.done).to.be.true;
  });
});
