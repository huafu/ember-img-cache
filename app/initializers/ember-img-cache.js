import ImgCacheEntry from '../ember-img-cache/img-cache-entry';

export default {
  name: 'ember-img-cache',

  initialize: function (container, application) {
    container.register('cache-entry:img-cache-entry', ImgCacheEntry, {singleton: false});

    application.inject('cache-entry:img-cache-entry', 'manager', 'service:img-manager');
    application.inject('view', 'imgManagerService', 'service:img-manager');
  }
};
