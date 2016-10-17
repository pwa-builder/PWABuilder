import Ember from 'ember';
import config from '../config/environment';

export default Ember.HTMLBars.makeBoundHelper(function(){
    return new Ember.Handlebars.SafeString('<a href=\''+config.APP.IMAGEGENERATOR_URL+'\'>App Image Generator</a>');
});
