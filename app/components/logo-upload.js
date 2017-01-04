import Ember from 'ember';

export default Ember.Component.extend({
  logoUrl: '',
  baseUrl: '',
  imageAlert: '',
  showAlert: false,
  hasAssets: false,
  isAddDisabled: function(){
    if(this.get('logoUrl') === ''){
      return true;
    } else {
      return false;
    }
  }.property('logoUrl'),
  getImageDataURI : function(file, callback) {
      var reader = new FileReader();

      reader.onload = function (aImg) {
        return callback(aImg.target.result);
      };
      reader.readAsDataURL(file);
  },
  getImageSize: function(aSrc) {
      var tmpImg = document.createElement('img');
      tmpImg.src = aSrc;
      return {
        width: tmpImg.width,
        height: tmpImg.height
      };
  },
  actions: {
    addLogo: function(){
      var self = this;

      var imageSrc = self.logoUrl;

      if(imageSrc.charAt(0) === '/'){
        imageSrc = imageSrc.slice(1);
      }

      if(imageSrc.indexOf('http') === -1){
        imageSrc = self.baseUrl + '/' + imageSrc;
      }

      var sizes = self.getImageSize(imageSrc);
      self.logos.pushObject({ src: self.logoUrl, sizes: sizes.width +'x'+sizes.height });

      self.set('logoUrl','');
      self.sendAction('action',self.logos);
      self.set('imageAlert', '');
      self.set('showAlert', false);
    },
    removeLogo: function(logo){
      this.logos.removeObject(logo);

      var logosGenerated = this.logos.filter(function (logo) {
        return logo.generated;
      });

      if (logosGenerated.length === 0) {
          this.sendAction('deleteAssetsAction');
      }

      this.sendAction('action',this.logos);
    },
    addUploadedImage: function(fileInfo, generateMissingImages, callback) {
      var self = this;
      if (generateMissingImages) {
        self.sendAction('generateMissingImageAction', fileInfo, callback);
      } else {
        self.getImageDataURI(fileInfo, function (dataUri) {
            var sizes = self.getImageSize(dataUri);

            self.logos.pushObject({ fileName: fileInfo.name, src: dataUri, sizes: sizes.width +'x'+sizes.height });
            self.sendAction('action',self.logos);

            callback();
          });
      }
    }
  }
});
