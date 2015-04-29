import Ember from 'ember';

export default Ember.Select.extend({
	change:function(){
		this.get('controller').updateSelect(this.modelProperty, this.selection);
	}
});
