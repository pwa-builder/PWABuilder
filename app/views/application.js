import Ember from 'ember';

export default Ember.View.extend({
	classNames:['application'],
	didInsertElement:function(){
		//Analytics Event Tracking
    var self = this;
		Ember.$(document).on('click','.event',function(){
			self.ga('send', 'event', 'item', 'click', Ember.$(this).data('eventname'));
		});
	}
});
