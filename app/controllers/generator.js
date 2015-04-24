import Ember from 'ember';

export default Ember.Controller.extend({
  selectedDisplay: null,
  selectedOrientation: null,
  watchDisplay: function() {
    var selected = this.get('selectedDisplay');
    if(selected){
      this.send('updateModelProperty', 'display', this.get('selectedDisplay'));
    }
  }.observes('selectedDisplay'),
  watchOrientation: function() {
    var selected = this.get('selectedOrientation');
    if(selected !== ''){
      this.send('updateModelProperty', 'orientation', this.get('selectedOrientation'));
    }
  }.observes('selectedOrientation'),
  watchModel: function() {
    // I want to call this.model.save() here, but that'll be an endless loop
  }.observes('model.manifest.wat_sharing')
});
