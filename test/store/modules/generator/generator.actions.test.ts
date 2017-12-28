import { ActionContext } from 'vuex';
import { RootState } from 'store';

import { expect, SinonStub, spy, stub } from 'test/libs/chai';
import { axiosMock } from 'test/libs/axios';

import { actionContextMockBuilder, nuxtAxiosMockBuilder } from 'test/utils';

import * as generator from 'store/modules/generator';
import { Manifest, helpers } from 'store/modules/generator';

let state: generator.State;
let actionContext: ActionContext<generator.State, RootState>;
let actions: generator.Actions<generator.State, RootState>;

describe('generator actions', () => {

    beforeEach(() => {
        state = generator.state();
        actionContext = actionContextMockBuilder<generator.State>(state);
        spy(actionContext, 'commit');
        stub(generator.helpers, 'getImageIconSize').returnsPromise().resolves(Promise.resolve({ width: 0, height: 0 }));
        actions = nuxtAxiosMockBuilder(generator.actions);
    });

    afterEach(() => {
        (generator.helpers.getImageIconSize as SinonStub).restore();
    });

    describe('when adds link with an invalid url', () => {
        it('should throw an error', () => {
            const url = 'httptest';

            expect(() => actions.updateLink(actionContext, url)).to.throw();
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

        it('should throw an error if params are incorrect and API respond with error', async () => {
            const url = 'http://microsoft.com';
            const status = 500;
            actionContext.state.url = url;

            axiosMock.onPost(`${process.env.apiUrl}/manifests`).reply(status, {});

            expect(actions.getManifestInformation(actionContext)).to.eventually.throw();
        });

        afterEach(() => {
            axiosMock.reset();
        });
    });

    describe('when submit empty url', () => {
        it('should throw an error', async () => {
            const url = '';
            actionContext.state.url = url;

            expect(actions.getManifestInformation(actionContext)).to.eventually.throw();
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

    describe('when add a related application', () => {
        it('should not commit an update if is not valid application', () => {
            const app = {
                platform: '',
                url: '',
                id: ''
            };

            expect(() => actions.addRelatedApplication(actionContext, app)).to.throw();
        });

        it('should commit an update if is a valid application', () => {
            const app = {
                platform: 'testplatform',
                url: 'website',
                id: 'myid'
            };

            actions.addRelatedApplication(actionContext, app);

            expect(actionContext.commit).to.have.been.calledWith(generator.types.ADD_RELATED_APPLICATION);
        });
    });

    describe('when add a custom member', () => {
        it('should not commit an update if member already exists', () => {
            const member = {
                name: 'test',
                value: '{}',
            };

            actionContext.state.members = [member];

            expect(() => actions.addCustomMember(actionContext, member)).to.throw();
        });

        it('should add prefix is doest not contain "_"', () => {
            const name = 'test';
            const member = {
                name,
                value: '{}',
            };

            actionContext.state.members = [];

            actions.addCustomMember(actionContext, member);

            expect(member.name).to.have.be.equal(generator.helpers.MEMBER_PREFIX + name);
        });

        it('should not commit an update if member value is not valid', () => {
            const member = {
                name: 'test',
                value: 'not a json',
            };

            actionContext.state.members = [];

            expect(() => actions.addCustomMember(actionContext, member)).to.throw();
        });

        it('should commit an update if member is valid', () => {
            const member = {
                name: 'test',
                value: '{}',
            };

            actionContext.state.members = [];

            actions.addCustomMember(actionContext, member);

            expect(actionContext.commit).to.have.been.calledWith(generator.types.ADD_CUSTOM_MEMBER);
        });
    });

    describe('when update color', () => {
        it('should commit with transparent if the selection is transparent', () => {
            const colorOption = helpers.COLOR_OPTIONS.transparent;
            const color = '#FF0000';
            const colorOptions = {
                colorOption,
                color
            };

            actions.updateColor(actionContext, colorOptions);

            expect(actionContext.commit).to.have.been.calledWith(generator.types.UPDATE_COLOR, colorOption);
        });

        it('should commit with none if the selection is none', () => {
            const colorOption = helpers.COLOR_OPTIONS.none;
            const color = '#FF0000';
            const colorOptions = {
                colorOption,
                color
            };

            actions.updateColor(actionContext, colorOptions);

            expect(actionContext.commit).to.have.been.calledWith(generator.types.UPDATE_COLOR, colorOption);
        });

        it('should commit with the selected color if the selection is pick', () => {
            const colorOption = helpers.COLOR_OPTIONS.pick;
            const color = '#FF0000';
            const colorOptions = {
                colorOption,
                color
            };

            actions.updateColor(actionContext, colorOptions);

            expect(actionContext.commit).to.have.been.calledWith(generator.types.UPDATE_COLOR, color);
        });
    });
});