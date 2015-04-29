/* global pluralize: global */
import Ember from 'ember';

export function pluralizeIt(options) {
  return pluralize(options[0], options[1]);
}

export default Ember.HTMLBars.makeBoundHelper(pluralizeIt);

