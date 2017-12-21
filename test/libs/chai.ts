import * as chai from 'chai';
import * as _sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(sinonChai);
chai.use(chaiAsPromised);

export const sinon = _sinon;
export const { expect, should, assert } = chai;