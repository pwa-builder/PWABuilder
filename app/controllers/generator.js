import Ember from 'ember';

export default Ember.Controller.extend({
  valueOrEmptyString: function (value) {
    if(value) {
      return value;
    } else {
      return '';
    }
  },
  updateSelect: function(property, value) {
    this.model.set(property, value);
    this.model.save();
  }
});
