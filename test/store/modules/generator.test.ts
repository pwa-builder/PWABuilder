import { ActionContext } from 'vuex';
import { RootState } from 'store';

import { expect, sinon } from 'test/libs/chai';
import { axiosMock } from 'test/libs/axios';

import { actionContextMockBuilder, nuxtAxiosMockBuilder } from 'test/utils';

import * as generator from 'store/modules/generator';

let state: generator.State;
let actionContext: ActionContext<generator.State, RootState>;
let actions: generator.Actions<generator.State, RootState>;

axiosMock.onPost(`${process.env.apiUrl}/manifests`).reply(200, {});

describe('generator', () => {

    beforeEach(() => {
        state = generator.state();
        actionContext = actionContextMockBuilder<generator.State>(state);
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

    describe('when wants to remove an icon', () => {
        it('should update the state without this icon', async () => {
            const icon = { src: 'icon', sizes: '1x1'};

            actionContext.state.icons = [icon];
            await actions.removeIcon(actionContext, icon);
            expect(actionContext.commit).to.not.have.been.calledWith(generator.types.UPDATE_ICONS, [icon]);
            expect(actionContext.commit).to.have.been.calledWith(generator.types.UPDATE_ICONS, []);
        });
    });
});