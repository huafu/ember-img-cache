import Ember from 'ember';
import { img } from 'ember-img-cache/helpers/img';
import ImgManager from 'ember-img-cache/services/img-manager';
import ImgCacheEntry from 'ember-img-cache/core/img-cache-entry';

Ember.Handlebars.registerBoundHelper('img', img);

export default {
  name: 'ember-img-cache',

  initialize: function (container, application) {
    container.register('service:ember-img-cache/services/img-manager', ImgManager, {singleton: true});
    container.register('cache-entry:ember-img-cache/core/img-cache-entry', ImgCacheEntry, {singleton: false});

    application.inject('cache-entry:ember-img-cache/core/img-cache-entry', 'manager', 'service:ember-img-cache/services/img-manager');
    application.inject('controller', 'eicManager', 'service:ember-img-cache/services/img-manager');
    application.inject('route', 'eicManager', 'service:ember-img-cache/services/img-manager');
    application.inject('view', 'eicManager', 'service:ember-img-cache/services/img-manager');
  }
};
