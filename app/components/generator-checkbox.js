import Ember from 'ember';

export default Ember.Checkbox.extend(Ember.ViewTargetActionSupport, {
  click: function(){
    this.triggerAction();
  }
});
