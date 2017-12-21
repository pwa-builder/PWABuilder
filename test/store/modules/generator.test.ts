import { ActionContext, MutationTree } from 'vuex';
import { RootState } from 'store';

import { expect, sinon } from 'test/libs/chai';
import { axiosMock } from 'test/libs/axios';

import { actionContextMockBuilder, nuxtAxiosMockBuilder } from 'test/utils';

import * as generator from 'store/modules/generator';
import { Manifest } from 'store/modules/generator';

let state: generator.State;
let actionContext: ActionContext<generator.State, RootState>;
let actions: generator.Actions<generator.State, RootState>;
let mutations: MutationTree<generator.State>;

describe('generator', () => {

    beforeEach(() => {
        state = generator.state();
        actionContext = actionContextMockBuilder<generator.State>(state);
        sinon.spy(actionContext, 'commit');
        actions = nuxtAxiosMockBuilder(generator.actions);
        mutations = generator.mutations;
        generator.helpers.getImageIconSize = (src: string) => Promise.resolve({ width: 0, height: 0 });
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

        it('should throw an if params are incorrect and API respond with error', async () => {
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

        it('should update the state with new application', () => {
            const payload = {
                platform: 'testplatform',
                url: 'website',
                id: 'myid'
            };

            state.manifest = {} as Manifest;
            state.manifest.related_applications = [];

            mutations[generator.types.ADD_RELATED_APPLICATION](state, payload);
            expect(state.manifest.related_applications.length).to.be.equal(1);
        });
    });

    describe('when remove a related application', () => {
        it('should not remove if index is not found', () => {
            const id = 'myid';
            const app = {
                platform: 'testplatform',
                url: 'website',
                id
            };

            state.manifest = {} as Manifest;
            state.manifest.related_applications = [app];

            mutations[generator.types.REMOVE_RELATED_APPLICATION](state, `${id}__`);
            expect(state.manifest.related_applications.length).to.be.equal(1);
        });

        it('should remove if index is found', () => {
            const id = 'myid';
            const app = {
                platform: 'testplatform',
                url: 'website',
                id
            };

            state.manifest = {} as Manifest;
            state.manifest.related_applications = [app];

            mutations[generator.types.REMOVE_RELATED_APPLICATION](state, id);
            expect(state.manifest.related_applications.length).to.be.equal(0);
        });
    });

    describe('when change prefer related application', () => {
        it('should change the state value', () => {
            const app = {
                platform: 'testplatform',
                url: 'website',
                id: 'myid'
            };

            state.manifest = {} as Manifest;
            state.manifest.prefer_related_applications = false;

            mutations[generator.types.UPDATE_PREFER_RELATED_APPLICATION](state, true);
            expect(state.manifest.prefer_related_applications).to.be.equal(true);
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

    describe('when remove a custom member', () => {
        it('should not remove if index is not found', () => {
            const name = 'name';
            const member = {
                name,
                value: '{}'
            };

            actionContext.state.members = [member];

            mutations[generator.types.REMOVE_CUSTOM_MEMBER](state, `${name}__`);
            expect(actionContext.state.members.length).to.be.equal(1);
        });

        it('should remove if index is found', () => {
            const id = 'myid';
            const app = {
                platform: 'testplatform',
                url: 'website',
                id
            };

            const name = 'name';
            const member = {
                name,
                value: '{}'
            };

            actionContext.state.members = [member];

            mutations[generator.types.REMOVE_CUSTOM_MEMBER](state, name);
            expect(actionContext.state.members.length).to.be.equal(0);
        });
    });
});