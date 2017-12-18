import { ActionContext } from 'vuex';
import { RootState } from 'store';

import { expect, sinon } from 'test/libs/chai';
import { axiosMock } from 'test/libs/axios';

import { actionContextMockBuilder, nuxtAxiosMockBuilder } from 'test/utils';

import * as generator from 'store/modules/generator';
import { Manifest } from 'store/modules/generator';

let state: generator.State;
let actionContext: ActionContext<generator.State, RootState>;
let actions: generator.Actions<generator.State, RootState>;

describe('generator', () => {

    beforeEach(() => {
        state = generator.state();
        actionContext = actionContextMockBuilder<generator.State>(state);
        sinon.spy(actionContext, 'commit');
        actions = nuxtAxiosMockBuilder(generator.actions);
        generator.helpers.getImageIconSize = (src: string) => Promise.resolve({ width: 0, height: 0 });
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
            const status = 200;
            actionContext.state.url = url;

            axiosMock.onPost(`${process.env.apiUrl}/manifests`).reply(status, {});

            await actions.getManifestInformation(actionContext);

            expect(actionContext.commit).to.have.been.calledWith(generator.types.UPDATE_WITH_MANIFEST);
            expect(actionContext.commit).to.have.been.calledWith(generator.types.SET_DEFAULTS_MANIFEST);
        });

        it('should update error if params are incorrect and API respond with error', async () => {
            const url = 'http://microsoft.com';
            const status = 500;
            actionContext.state.url = url;

            axiosMock.onPost(`${process.env.apiUrl}/manifests`).reply(status, {});

            await actions.getManifestInformation(actionContext)
            .catch(e => {
                expect(e.response.status).to.be.equal(status);
                expect(actionContext.commit).to.have.been.calledWith(generator.types.UPDATE_ERROR);
            });

            expect(actionContext.commit).to.not.have.been.calledWith(generator.types.UPDATE_WITH_MANIFEST);
            expect(actionContext.commit).to.not.have.been.calledWith(generator.types.SET_DEFAULTS_MANIFEST);

        });

        afterEach(() => {
            axiosMock.reset();
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

    describe('when tries to remove an icon', () => {
        it('should update the state without this icon', async () => {
            const icon = { src: 'icon', sizes: '1x1'};
            actionContext.state.icons = [icon];

            await actions.removeIcon(actionContext, icon);
            expect(actionContext.commit).to.not.have.been.calledWith(generator.types.UPDATE_ICONS, [icon]);
            expect(actionContext.commit).to.have.been.calledWith(generator.types.UPDATE_ICONS, []);
        });
    });

    describe('when adds and icon from url', () => {
        it('should not change state if src is empty', async () => {
            const src = '';

            await actions.addIconFromUrl(actionContext, src);
            expect(actionContext.commit).to.not.have.been.calledWith(generator.types.ADD_ICON);
        });

        it('should add website url as prefix if doesn\'t have it', async () => {
            const src = 'icon.png';
            const baseUrl = 'http://microsoft.com/';

            actionContext.state.manifest = actionContext.state.manifest || {} as Manifest;
            actionContext.state.manifest.start_url = baseUrl;

            await actions.addIconFromUrl(actionContext, src);
            expect(actionContext.commit).to.have.been.calledWith(generator.types.ADD_ICON, {src: baseUrl + src, sizes: '0x0'});
        });

        it('should remove slash if necessary', async () => {
            const src = '/icon.png';
            const baseUrl = 'http://microsoft.com/';

            actionContext.state.manifest = actionContext.state.manifest || {} as Manifest;
            actionContext.state.manifest.start_url = baseUrl;

            await actions.addIconFromUrl(actionContext, src);
            expect(actionContext.commit).to.have.been.calledWith(generator.types.ADD_ICON, {src: baseUrl + src.slice(1), sizes: '0x0'});
        });
    });

    describe('when reset generator states', () => {
        it('should reset states', () => {
            actions.resetStates(actionContext);
            expect(actionContext.commit).to.have.been.calledWith(generator.types.RESET_STATES);
        });
    });
});