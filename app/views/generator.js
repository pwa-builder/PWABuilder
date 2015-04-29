import Ember from 'ember';

export default Ember.View.extend({
	classNames:['l-app-style'],
	didInsertElement:function(){
		Ember.$('.application').addClass('l-app-style').addClass('no-header');
		Ember.$('footer').addClass('is-small');
	}
});
