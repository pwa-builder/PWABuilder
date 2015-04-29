import Ember from "ember"; 

export default Ember.Handlebars.makeBoundHelper(function(){
		return new Date().getFullYear();
});