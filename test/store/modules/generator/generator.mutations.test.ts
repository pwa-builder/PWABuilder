import { MutationTree, ActionContext } from 'vuex';

import { expect } from 'test/libs/chai';

import * as generator from 'store/modules/generator';
import { Manifest } from 'store/modules/generator';
import { actionContextMockBuilder } from 'test/utils';
import { RootState } from 'store';

let state: generator.State;
let actionContext: ActionContext<generator.State, RootState>;
let mutations: MutationTree<generator.State>;

describe('store generator mutations', () => {

    beforeEach(() => {
        state = generator.state();
        actionContext = actionContextMockBuilder<generator.State>(state);
        mutations = generator.mutations;
    });

    describe('when add a related application', () => {
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
            state.manifest = {} as Manifest;
            state.manifest.prefer_related_applications = false;

            mutations[generator.types.UPDATE_PREFER_RELATED_APPLICATION](state, true);
            expect(state.manifest.prefer_related_applications).to.be.equal(true);
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