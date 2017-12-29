import { expect } from 'test/libs/chai';

import * as root from 'store/root';
import { RootState } from 'store';

describe('store root', () => {

    describe('when getStaticContentNames receives a collection', () => {
        it('should return empty array if collection is null', () => {
            const collection = null;
            
            expect(root.helpers.getStaticContentNames(collection)).to.be.an('array').that.is.empty;
        });

        it('should return mapped array if collection has values', () => {
            const collection = [
                { code: '1', name: 'test'}
            ];
            
            expect(root.helpers.getStaticContentNames(collection)[0]).to.be.equal(collection[0].name);
        });

        it('should works fin when is ussed in a getter', () => {
            const collection = [
                { code: '1', name: 'test'}
            ];

            const state = {
                languages: collection,
                displays: collection,
                orientations: collection
            };
            
            expect(root.getters.languagesNames(state, null, {} as RootState, null)[0]).to.be.equal(collection[0].name);
            expect(root.getters.displaysNames(state, null, {} as RootState, null)[0]).to.be.equal(collection[0].name);
            expect(root.getters.orientationsNames(state, null, {} as RootState, null)[0]).to.be.equal(collection[0].name);
        });
    });
});