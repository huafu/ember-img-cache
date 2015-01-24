import Ember from 'ember';

Ember.Test.registerHelper('lookup', function (app, name, options) {
  var container = app.__container__;
  return container.lookup.apply(container, [].slice.call(arguments, 1));
});
