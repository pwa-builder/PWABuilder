import { expect } from 'test/libs/chai';

import defaultMiddleware from '~/middleware/default';

let paramsMockBuilder = (route: string) => ({
    route: {
        path: route
    },
    redirect: (path) => path
});

let params;

describe('default middleware', () => {

    describe('when the middleware is loaded', () => {
        it('should return if url is not generator', () => {
            const route = '/test';
            params = paramsMockBuilder(route);
            
            expect(defaultMiddleware(params)).to.be.undefined;
        });

        it('should redirect to home if url is not generator', () => {
            const route = '/generator';
            params = paramsMockBuilder(route);
            expect(defaultMiddleware(params)).to.be.equal('/');
        });
    });
});