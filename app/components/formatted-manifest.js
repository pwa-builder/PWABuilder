/* global Prism:true */ 

import Ember from 'ember';

export default Ember.Component.extend({
	didInsertElement: (function(){
		Prism.highlightElement(this.$("code")[0]);
	}),
	tagName:'pre',
  	schedulePrism: (function(){
    	// scheduleOnce debounces prism highlighting to only run once per
    	// runloop. highlighting is called on didInsertElement, and
    	// whenever model.formattedManifest changes.
    	Ember.run.scheduleOnce('afterRender', this, this.highlightTime);
  	}).observes('data.formattedManifest'),
  	highlightTime: (function(){
  		Prism.highlightElement(this.$("code")[0]);
  	})
});
