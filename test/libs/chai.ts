import * as chai from 'chai';
import * as _sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

chai.use(sinonChai);

export const sinon = _sinon;
export const { expect, should, assert } = chai;