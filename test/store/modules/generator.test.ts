import { expect, use } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { ActionContext } from 'vuex';
import { actionContextMockBuilder } from '../../utils/action-context.mock';
import * as generator from 'store/modules/generator';
import { RootState } from 'store';

use(sinonChai);

let state: generator.State;
let actionContext: ActionContext<any, any>;

describe('generator', () => {

    beforeEach(() => {
        state = generator.state();
        actionContext = actionContextMockBuilder<any>(state);
        sinon.spy(actionContext, 'commit');
    });

    describe('when adds link with an invalid url', () => {
        it('should update state with error', () => {
            const url = 'httptest';
            generator.actions.updateLink(actionContext, url);

            expect(actionContext.commit).to.have.been.calledWith(generator.types.UPDATE_ERROR);
        });
    });

    describe('when adds link with a valid url', () => {
        it('should update state with the new url', () => {
            const url = 'http://microsoft.com';
            generator.actions.updateLink(actionContext, url);

            expect(actionContext.commit).to.have.been.calledWith(generator.types.UPDATE_LINK, url);
        });
    });

    describe('when adds link without http://', () => {
        it('should change it to have https://', () => {
            const url = 'microsoft.com';
            generator.actions.updateLink(actionContext, url);

            expect(actionContext.commit).to.have.been.calledWith(generator.types.UPDATE_LINK, 'https://' + url);
        });
    });
});