import Ember from 'ember';

export default Ember.Checkbox.extend({
  hookup: function(){
    var action = this.get('action');
    if(action){
      this.on('change', this, this.sendHookup);
    }
  }.on('init'),
  sendHookup: function(){
    console.log('sendHookup');
    this.sendAction('action', this.$().prop('checked'));
  },
  cleanup: function(){
    this.off('change', this, this.sendHookup);
  }.on('willDestroyElement')
});
