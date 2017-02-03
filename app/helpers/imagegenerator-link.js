import Ember from 'ember';
import config from '../config/environment';

export default Ember.HTMLBars.makeBoundHelper(function(){
    return new Ember.Handlebars.SafeString('<a class="pwa-header-link" href=\''+config.APP.IMAGEGENERATOR_URL+'\'>PWA Image Generator</a>');
});
