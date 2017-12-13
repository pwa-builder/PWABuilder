import { ActionContext } from 'vuex';
import { RootState } from 'store';

import { expect, sinon } from 'test/libs/chai';
import { axiosMock } from 'test/libs/axios';

import { actionContextMockBuilder, nuxtAxiosMockBuilder } from 'test/utils';

import * as serviceworker from 'store/modules/serviceworker';

let state: serviceworker.State;
let actionContext: ActionContext<serviceworker.State, RootState>;
let actions: serviceworker.Actions<serviceworker.State, RootState>;

axiosMock.onGet(`${process.env.apiUrl}/serviceworkers?ids=1`).reply(200, {});

describe('serviceworker', () => {

    beforeEach(() => {
        state = serviceworker.state();
        actionContext = actionContextMockBuilder<serviceworker.State>(state);
        sinon.spy(actionContext, 'commit');
        actions = nuxtAxiosMockBuilder(serviceworker.actions);
    });

    describe('when download service worker', () => {
        it('should change generate download link', async () => {
            const serviceworkerId = 1;
            await actions.downloadServiceWorker(actionContext, serviceworkerId);
            expect(actionContext.commit).to.have.been.calledWith(serviceworker.types.UPDATE_ARCHIVE);
        });
    });

    describe('when download service worker with null serviceworkerId', () => {
        it('should return error message', async () => {
            await actions.downloadServiceWorker(actionContext, 0);
            expect(actionContext.commit).to.have.been.calledWith(serviceworker.types.UPDATE_ERROR);
        });
    });
});