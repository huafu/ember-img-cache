import Ember from 'ember';
import startApp from '../helpers/start-app';

var App;

module('Acceptance: WithoutCache', {
  setup: function() {
    App = startApp();
    window.loaded = 0;
    window.error = 0;
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('visiting /without-cache', function() {
  visit('/without-cache');

  wait(500);
  andThen(function() {
    equal(currentPath(), 'without-cache');
    strictEqual(window.error, 100, 'there should have been 100 error');
    strictEqual(window.loaded, 100, 'there should have been 100 load');
  });
});
