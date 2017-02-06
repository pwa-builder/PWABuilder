import Ember from 'ember';
import config from '../config/environment';

export default Ember.HTMLBars.makeBoundHelper(function(classes){
    return new Ember.Handlebars.SafeString('<a class="' + classes + '" href=\''+config.APP.IMAGEGENERATOR_URL+'\'>PWA Image Generator</a>');
});
