import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(sinonChai);
chai.use(chaiAsPromised);

export { expect, should, assert } from 'chai';
export { SinonStub, spy, stub } from 'sinon';