import Ember from 'ember';
import EmberUploader from 'ember-uploader';

export default EmberUploader.FileField.extend({
  url: '',
  filesDidChange: (function() {
    var uploadUrl = this.get('url');
    var files = this.get('files');

    var uploader = EmberUploader.Uploader.create({
      url: uploadUrl
    });

    if (!Ember.isEmpty(files)) {
      uploader.upload(files[0]);
    }
  }).observes('files')
});