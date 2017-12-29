import { expect } from 'test/libs/chai';

import * as i18n from 'store/modules/i18n';

let state: i18n.State;

describe('store i18n', () => {

    beforeEach(() => {
        state = i18n.state();
    });

    describe('when set new language', () => {
        it('should not change the language if not exist', () => {
            const newLang = 'randomLanguage';
            i18n.mutations[i18n.types.SET](state, newLang);
            expect(state.locale).to.not.equal(newLang);
        });

        it('should keep the new language in the state', () => {
            const newLang = 'es';
            i18n.mutations[i18n.types.SET](state, newLang);
            expect(state.locale).to.equal(newLang);
        });
    });
});