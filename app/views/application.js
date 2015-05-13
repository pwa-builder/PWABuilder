import Ember from 'ember';

export default Ember.View.extend({
	classNames:['application'],
	didInsertElement:function(){
		//Analytics Event Tracking
		Ember.$(document).on('click','.event',function(){
			this.ga('send', 'event', 'item', 'click', Ember.$(this).data('eventname'));
		});
	}
});
