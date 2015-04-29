import Ember from 'ember';

export function codeFormat(params) {
    return params[0].charAt(0).toUpperCase() + params[0].slice(1).replace(/-/g, ' ');
}

export default Ember.HTMLBars.makeBoundHelper(codeFormat);
