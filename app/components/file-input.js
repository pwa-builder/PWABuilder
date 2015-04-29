import Ember from 'ember';

export default Ember.TextField.extend({
  type: 'file',
  attributeBindings: ['name'],
  change: function(evt) {
    var input = evt.target;
    if (input.files && input.files[0]) {
      this.sendAction('action', input.files[0]);
    }
  }
});
