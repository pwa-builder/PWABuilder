import { expect } from 'chai';
import * as sinon from 'sinon';
import { ActionContext } from 'vuex';
import { actionContextMockBuilder } from '../../utils/action-context.mock';
import * as generator from 'store/modules/generator';
import { RootState } from 'store';

let state: generator.State;
let actionContext: ActionContext<generator.State, RootState>;

describe('generator', () => {

    beforeEach(() => {
        state = generator.state();
        actionContext = actionContextMockBuilder<generator.State>(state);
        sinon.spy(actionContext, 'commit');
    });

    describe('when adds link without http://', () => {
        it('should change it to have https://', () => {
            const url = 'microsoft.com';
            // generator.actions.updateLink();

            // expect(actionContext.commit).to.have.been.calledWith(generator.types.UPDATE_LINK, 'hola');
        });
    });
});