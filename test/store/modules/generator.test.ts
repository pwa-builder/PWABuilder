import { expect, use } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import axios from 'axios';
import * as MockAdapter from 'axios-mock-adapter';
import { ActionContext } from 'vuex';
import { actionContextMockBuilder, nuxtAxiosMockBuilder, configureEnv } from '../../utils';
import * as generator from 'store/modules/generator';
import { RootState } from 'store';

use(sinonChai);

let state: generator.State;
let actionContext: ActionContext<any, any>;
let actions: generator.Actions<any, any>;
let mock = new MockAdapter(axios);
// Todo: Move to general configuration
process.env = configureEnv();

mock.onPost(`${process.env.apiUrl}/manifests`).reply(200, {});

describe('generator', () => {

    beforeEach(() => {
        state = generator.state();
        actionContext = actionContextMockBuilder<any>(state);
        sinon.spy(actionContext, 'commit');
        actions = nuxtAxiosMockBuilder(generator.actions);
    });

    describe('when adds link with an invalid url', () => {
        it('should update state with error', () => {
            const url = 'httptest';
            actions.updateLink(actionContext, url);

            expect(actionContext.commit).to.have.been.calledWith(generator.types.UPDATE_ERROR);
        });
    });

    describe('when adds link with a valid url', () => {
        it('should update state with the new url', () => {
            const url = 'http://microsoft.com';
            actions.updateLink(actionContext, url);

            expect(actionContext.commit).to.have.been.calledWith(generator.types.UPDATE_LINK, url);
        });
    });

    describe('when adds link without http://', () => {
        it('should change it to have https://', () => {
            const url = 'microsoft.com';
            actions.updateLink(actionContext, url);

            expect(actionContext.commit).to.have.been.calledWith(generator.types.UPDATE_LINK, 'https://' + url);
        });
    });

    describe('when submit url', () => {
        it('should change generate manifest information', async () => {
            const url = 'http://microsoft.com';
            actionContext.state.url = url;
            await actions.getManifestInformation(actionContext);
            expect(actionContext.commit).to.have.been.calledWith(generator.types.UPDATE_WITH_MANIFEST);
            expect(actionContext.commit).to.have.been.calledWith(generator.types.SET_DEFAULTS_MANIFEST);
        });
    });

    describe('when submit empty url', () => {
        it('should return error message', async () => {
            const url = '';
            actionContext.state.url = url;
            await actions.getManifestInformation(actionContext);
            expect(actionContext.commit).to.have.been.calledWith(generator.types.UPDATE_ERROR);
        });
    });
});