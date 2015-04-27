import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'a',
  anchor: '',
  classNames: ['skip-link'],
  // Used so that upon clicking on the link
  // anchor behaviors are ignored
  click: function(){
    this.scrollTo();
  },
  scrollTo: function(){
    var self = this;
    var anchor = this.get('anchor');
    var $el = Ember.$(anchor);
    if($el){
      // Scrolls to the top of main content or whatever
      // is passed to the anchor attribute
      Ember.$('body').scrollTop($el.offset().top);

      // This sets focus on the content which was skipped to
      // upon losing focus, the tabindex should be removed
      // so that normal keyboard navigation picks up from focused
      // element
      Ember.$($el).attr('tabindex', -1).on('blur focusout', function(){
        self.$(this).removeAttr('tabindex');
      }).focus();
    }
  }.on('click')
});
