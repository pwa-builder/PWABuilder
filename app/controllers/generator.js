import Ember from 'ember';
import _ from 'lodash';

export default Ember.Controller.extend({
  selectedDisplay: null,
  selectedOrientation: null,
  valueOrEmptyString: function (value) {
    if(value) {
      return value;
    } else {
      return '';
    }
  },
  customMembers: function(){
    var staticValues = ['lang','name','short_name','scope','icons','display','orientation','start_url','theme_color','related_applications','prefer_related_applications'];
    var model = this.get('model');
    var keys = _.keys(model.manifest);
    var customKeys = _.difference(keys,staticValues);
    var customProps = _.map(customKeys,function(key){
      var data = {
        member_name: key,
        member_value: model.manifest[key]
      };
      return data;
    });

    return customProps;
  }.property('model'),
  watchDisplay: function() {
    var selected = this.get('selectedDisplay');
    this.send('updateModelProperty', 'display', this.valueOrEmptyString(selected));
  }.observes('selectedDisplay'),
  watchOrientation: function() {
    var selected = this.get('selectedOrientation');
    this.send('updateModelProperty', 'orientation', this.valueOrEmptyString(selected));
  }.observes('selectedOrientation')
});
