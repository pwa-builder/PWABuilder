import { expect } from 'test/libs/chai';

import * as generator from 'store/modules/generator';

describe('generator helpers', () => {

    describe('when isValidUrl receive an invalid url', () => {
        it('should return false', () => {
            const url = 'httmicrosoft.com';
            expect(generator.helpers.isValidUrl(url)).to.be.equal(false);
        });
    });

    describe('when isValidUrl receive a valid url', () => {
        it('should return true', () => {
            const url = 'http://microsoft.com';
            expect(generator.helpers.isValidUrl(url)).to.be.equal(true);
        });
    });

    describe('when getImageIconSize has an undefined document', () => {
        it('should return empty object', async () => {
            const src = '';
            const response = { width: 0, height: 0 };

            (document as any) = undefined;
            
            const sizes = await generator.helpers.getImageIconSize(src);

            expect(sizes.width).to.be.equal(response.width);
            expect(sizes.height).to.be.equal(response.height);
        });
    });

    describe('when getImageIconSize has an undefined document', () => {
        it('should return empty object', async () => {
            const src = '';
            const response = { width: 0, height: 0 };

            (document as any) = undefined;
            
            const sizes = await generator.helpers.getImageIconSize(src);

            expect(sizes.width).to.be.equal(response.width);
            expect(sizes.height).to.be.equal(response.height);
        });
    });
});