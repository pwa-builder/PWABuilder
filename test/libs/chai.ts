import * as chai from 'chai';
import * as sinon from 'sinon';
let sinonStubPromise = require('sinon-stub-promise'); // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/11880
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';

sinonStubPromise(sinon);
chai.use(sinonChai);
chai.use(chaiAsPromised);

export { expect, should, assert } from 'chai';
export { SinonStub, spy, stub } from 'sinon';