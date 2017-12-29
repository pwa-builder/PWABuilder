import { ActionContext } from 'vuex';
import { RootState } from 'store';

import { expect, spy } from 'test/libs/chai';
import { axiosMock } from 'test/libs/axios';

import { actionContextMockBuilder, nuxtAxiosMockBuilder } from 'test/utils';

import * as serviceworker from 'store/modules/serviceworker';

let state: serviceworker.State;
let actionContext: ActionContext<serviceworker.State, RootState>;
let actions: serviceworker.Actions<serviceworker.State, RootState>;

describe('store serviceworker', () => {

    beforeEach(() => {
        state = serviceworker.state();
        actionContext = actionContextMockBuilder<serviceworker.State>(state);
        spy(actionContext, 'commit');
        actions = nuxtAxiosMockBuilder(serviceworker.actions);
    });

    describe('when download service worker', () => {
        it('should change generate download link', async () => {
            const serviceworkerId = 1;
            const status = 200;

            axiosMock.onGet(`${process.env.apiUrl}/serviceworkers?ids=${serviceworkerId}`).reply(status, {});

            await actions.downloadServiceWorker(actionContext, serviceworkerId);

            expect(actionContext.commit).to.have.been.calledWith(serviceworker.types.UPDATE_ARCHIVE);
        });

        it('should throw an error if params are incorrect and API respond with error', () => {
            const serviceworkerId = -1;
            const status = 500;

            axiosMock.onGet(`${process.env.apiUrl}/serviceworkers?ids=${serviceworkerId}`).reply(status, {});

            expect(actions.downloadServiceWorker(actionContext, serviceworkerId)).to.eventually.throw();
        });

        it('should throw an error if we send null serviceworkerId param', () => {
            expect(actions.downloadServiceWorker(actionContext, 0)).to.eventually.throw();
        });

        afterEach(() => {
            axiosMock.reset();
        });
    });

    describe('when get code', () => {
        it('should change code', async () => {
            const serviceworkerId = 1;
            const status = 200;
            axiosMock.onGet(`${process.env.apiUrl}/serviceworkers/previewcode?ids=${serviceworkerId}`).reply(status, {});

            await actions.getCode(actionContext, serviceworkerId);

            expect(actionContext.commit).to.have.been.calledWith(serviceworker.types.UPDATE_SERVICEWORKERPREVIEW);
            expect(actionContext.commit).to.have.been.calledWith(serviceworker.types.UPDATE_WEBPREVIEW);
        });

        it('should update error if params are incorrect and API respond with error', () => {
            const serviceworkerId = -1;
            const status = 500;

            axiosMock.onGet(`${process.env.apiUrl}/serviceworkers/previewcode?ids=${serviceworkerId}`).reply(status, {});

            expect(actions.getCode(actionContext, serviceworkerId)).to.eventually.throw();
        });

        it('should return error message if we send null serviceworkerId param', () => {
            expect(actions.getCode(actionContext, 0)).to.eventually.throw();
        });

        afterEach(() => {
            axiosMock.reset();
        });
    });

    describe('when reset serviceworker states', () => {
        it('should reset states', () => {
            actions.resetStates(actionContext);
            expect(actionContext.commit).to.have.been.calledWith(serviceworker.types.RESET_STATES);
        });
    });
});