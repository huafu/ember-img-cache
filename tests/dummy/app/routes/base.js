import Ember from 'ember';

export default Ember.Route.extend({
  model: function () {
    var data = [];
    for (var i = 0; i < 100; i++){
      data.push({
        validUrl:   'assets/passed.png',
        invalidUrl: 'dummy-stupid-crap.png'
      });
    }
    return Ember.RSVP.resolve(data);
  }
});
