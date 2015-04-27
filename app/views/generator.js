import Ember from 'ember';

export default Ember.View.extend({
	classNames:['l-app-style'],
	didInsertElement:function(){
		$('.application').addClass('l-app-style');
	}
});
