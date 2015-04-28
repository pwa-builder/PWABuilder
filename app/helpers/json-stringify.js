import Ember from 'ember';

export function stringified(params) {
    return JSON.stringify(params[0],null,2);
}

export default Ember.HTMLBars.makeBoundHelper(stringified);
