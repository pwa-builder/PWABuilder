import Ember from 'ember';

export default Ember.Select.extend({
	change:function(){
		if (this.selectionProperty !== undefined) {
			this.set('selection', this.selection[this.selectionProperty]);
		}
		this.get('controller').updateSelect(this.modelProperty, this.selection);
	}
});
