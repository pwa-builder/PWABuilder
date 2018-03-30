import { expect, stub } from 'test/libs/chai';

import * as generator from 'store/modules/generator';
import colorConverter from 'utils/color-converter';
import { SinonStub } from 'sinon';
import { CodeIssue, CodeError } from 'store/modules/generator';

class MockImage {
    constructor(public width = 0, public height = 0) {
        setTimeout(() => {
            this.onload();
        }, 10);
    }

    public onload() {}
}

describe('store generator helpers', () => {

    describe('when isValidUrl receives an url', () => {
        it('should return false if url is invalid', () => {
            const url = 'httmicrosoft.com';
            expect(generator.helpers.isValidUrl(url)).to.be.equal(false);
        });

        it('should return true if url is valid', () => {
            const url = 'http://microsoft.com';
            expect(generator.helpers.isValidUrl(url)).to.be.equal(true);
        });
    });

    describe('when getImageIconSize receives a src', () => {
        it('should return the correct object with default size if there is no document', async () => {
            // Simple stub to onload images
            // to more complex logic use jsdom
            const _global = global as any;
            const size = -1;
            
            _global.document = undefined;

            const src = '';
            const response = { width: size, height: size};

            const sizes = await generator.helpers.getImageIconSize(src);

            expect(sizes.width).to.be.equal(response.width);
            expect(sizes.height).to.be.equal(response.height);
        });

        it('should return the correct object with size if document exist', async () => {
            const _global = global as any;
            const size = 10;
    
            _global.document = { 
                createElement: (src: string) => new MockImage(size, size)
            };

            const src = '';
            const response = { width: size, height: size};

            const sizes = await generator.helpers.getImageIconSize(src);
            expect(sizes.width).to.be.equal(response.width);
            expect(sizes.height).to.be.equal(response.height);
        });
    });

    describe('when prepareIconsUrls receives an array', () => {
        it('should return empty array if is empty', () => {
            const icons = [];
            const baseUrl = '';

            expect(generator.helpers.prepareIconsUrls(icons, baseUrl).length).to.be.equal(0);
        });

        it('should return an array with baseUrl/src if the icons have not slashes', () => {
            const icons = [{
                src: 'test',
                sizes: '0x0'
            }];
            const baseUrl = 'https://test.com';

            expect(generator.helpers.prepareIconsUrls(icons, baseUrl)[0].src).to.be.equal(`${baseUrl}/test`);
        });

        it('should return an array with baseUrl/src if the icons haveslashes', () => {
            const icons = [{
                src: '/test',
                sizes: '0x0'
            }];
            const baseUrl = 'https://test.com';

            expect(generator.helpers.prepareIconsUrls(icons, baseUrl)[0].src).to.be.equal(`${baseUrl}/test`);
        });

        it('should return an array with baseUrl/src if the baseUrl has slashes', () => {
            const icons = [{
                src: 'test',
                sizes: '0x0'
            }];
            const baseUrl = 'https://test.com';

            expect(generator.helpers.prepareIconsUrls(icons, baseUrl)[0].src).to.be.equal(`${baseUrl}/test`);
        });

        it('should return an array with baseUrl/src if the baseUrl and icons have slashes', () => {
            const icons = [{
                src: '/test',
                sizes: '0x0'
            }];
            const baseUrl = 'https://test.com';

            expect(generator.helpers.prepareIconsUrls(icons, baseUrl)[0].src).to.be.equal(`${baseUrl}/test`);
        });
    });

    describe('when hasRelatedApplicationErrors receives an app', () => {
        it('should return the error error.enter_platform if there is no platform', () => {
            const app = {
                platform: null,
                url: null,
                id: null
            };

            expect(generator.helpers.hasRelatedApplicationErrors(app)).to.be.equal('error.enter_platform');
        });

        it('should return the error error.enter_url if there is no url and id', () => {
            const app = {
                platform: 'test',
                url: null,
                id: null
            };

            expect(generator.helpers.hasRelatedApplicationErrors(app)).to.be.equal('error.enter_url');
        });

        it('should return the error error.enter_valid_url if the url is not valid', () => {
            const app = {
                platform: 'test',
                url: '$$',
                id: 'test'
            };

            expect(generator.helpers.hasRelatedApplicationErrors(app)).to.be.equal('error.enter_valid_url');
        });

        it('should return undefined if there is no problem', () => {
            const app = {
                platform: 'test',
                url: 'microsoft.com',
                id: 'test'
            };

            expect(generator.helpers.hasRelatedApplicationErrors(app)).to.be.equal(undefined);
        });
    });

    describe('when fixColorFromServer receives a color', () => {
        it('should return empty string if color is empty', () => {
            const color = '';
            expect(generator.helpers.fixColorFromServer(color)).to.be.equal('');
        });

        it('should return an hexadececimal color if color is not empty', () => {
            const color = 'rgb(0, 0, 0)';

            stub(colorConverter, 'toHexadecimal').returns('0000000000');

            expect(generator.helpers.fixColorFromServer(color)).to.be.equal('#000000');

            (colorConverter.toHexadecimal as SinonStub).restore();
        });
    });

    describe('when sumIssues an array of issues', () => {
        it('should return 0 if the array is null', () => {
            const errors = null;
            expect(generator.helpers.sumIssues(errors)).to.be.equal(0);
        });

        it('should return the correct amount if the array has issues', () => {
            const errors = [
                {
                    issues: [{} as CodeIssue, {} as CodeIssue]
                } as CodeError
            ];
            expect(generator.helpers.sumIssues(errors)).to.be.equal(2);
        });
    });
});