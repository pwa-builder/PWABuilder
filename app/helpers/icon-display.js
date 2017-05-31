import Ember from 'ember';

export default Ember.HTMLBars.makeBoundHelper(function(value, options) {
  var escapedSrc = Ember.Handlebars.Utils.escapeExpression(options.src),
    escapedBase = Ember.Handlebars.Utils.escapeExpression(options.base);

    if(escapedSrc.charAt(0) === '/'){
      escapedSrc = escapedSrc.substring(1, escapedSrc.length);
    }

    if(escapedBase.slice(-1) === '/'){
      escapedBase = escapedBase.substring(0, escapedBase.length - 1);
    }
    else if(escapedBase.lastIndexOf('/') > 'http://'.length)
    {
      escapedBase = escapedBase.substring(0, escapedBase.lastIndexOf('/'));
    }
    var url = escapedSrc;
    if (url.indexOf('data:') !== 0) {
      if(url.indexOf('http') === -1){
        url = escapedBase + '/'+ escapedSrc;
      }
    }

  return new Ember.Handlebars.SafeString('<img class=\'icon-preview\' src=\''+url+'\' />');
});
