/* global _:true */
import Ember from 'ember';

export default Ember.Component.extend({
  member_name: '',
  member_value: '',
  memberAlert: '',
  showAlert: false,
  members: Ember.A(),
  actions: {
    addMember: function () {
      var self = this;
      self.set('memberAlert','');
      self.set('showAlert',false);

      var members = this.get('members');
      if(_.some(members,'member_name',this.get('member_name'))){
        self.set('memberAlert','A custom value with that key already exists');
        self.set('showAlert',true);
        return;
      }
      var member = {};
      var member_name = this.get('member_name');
      if(member_name.indexOf('_') === -1){
        member_name = 'mjs_'+member_name;
      }
      var member_value = this.get('member_value');
      if(member_name && member_value) {
        member.member_name = member_name;
        try{
          member.member_value = JSON.parse(member_value);
          members.pushObject(member);
          self.sendAction('action', 'add', member);
          self.set('member_name', '');
          self.set('member_value', '');
        }
        catch(e){
          self.set('memberAlert','There was a problem parsing the value.  Make sure it is valid JSON (strings must be wrapped in quotes)');
          self.set('showAlert',true);
        }
      }
    },
    removeMember: function(member){
      var members = this.get('members');
      members.removeObject(member);
      this.sendAction('action', 'remove', member);
    }
  }
});
