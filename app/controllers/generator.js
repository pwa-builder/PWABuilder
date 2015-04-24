import Ember from 'ember';

export default Ember.Controller.extend({
  selectedDisplay: null,
  selectedOrientation: null,
  valueOrEmptyString: function (value) {
    if(value) {
      return value;
    } else {
      return '';
    }
  },
  watchDisplay: function() {
    var selected = this.get('selectedDisplay');
    this.send('updateModelProperty', 'display', this.valueOrEmptyString(selected));
  }.observes('selectedDisplay'),
  watchOrientation: function() {
    var selected = this.get('selectedOrientation');
    this.send('updateModelProperty', 'orientation', this.valueOrEmptyString(selected));
  }.observes('selectedOrientation')
});
