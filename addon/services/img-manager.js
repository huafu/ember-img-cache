import Ember from 'ember';

var ImgManagerService = Ember.Object.extend(Ember.Evented, {
  /**
   * Class to be ued on images which are currently loading
   * @property loadingClass
   * @type String
   */
  loadingClass: '-eic-loading',
  /**
   * Class to be ued on images which are successfully loaded
   * @property successClass
   * @type String
   */
  successClass: '-eic-success',
  /**
   * Class to be ued on images which failed loading
   * @property errorClass
   * @type String
   */
  errorClass: '-eic-error',
  /**
   * Number of cache total hits
   * @property hits
   * @type Number
   */
  hits: Ember.computed.sum('_cacheEntries.@each.hits'),
  /**
   * All img cache entries which are in error state
   * @property errorCacheEntries
   * @type Array
   */
  errorCacheEntries: Ember.computed.filterBy('_cacheEntries', 'isError', true),
  /**
   * All img cache entries which are in loading state
   * @property loadingCacheEntries
   * @type Array
   */
  loadingCacheEntries: Ember.computed.filterBy('_cacheEntries', 'isLoading', true),
  /**
   * All img cache entries which are in success state
   * @property successCacheEntries
   * @type Array
   */
  successCacheEntries: Ember.computed.filterBy('_cacheEntries', 'isError', false),
  /**
   * All img cache entries
   * @property allCacheEntries
   * @type Array
   */
  allCacheEntries: Ember.computed.filterBy('_cacheEntries', '__dummy__', undefined),
  /**
   * Our internal cache entries index
   * @property _cacheEntriesIndex
   * @type Object
   * @private
   */
  _cacheEntriesIndex: function () {
    return Object.create(null);
  }.property().readOnly(),

  /**
   * Our internal cache entries
   * @property _cacheEntries
   * @type Ember.Array
   * @private
   */
  _cacheEntries: function () {
    return Ember.A();
  }.property().readOnly(),

  /**
   * The last generated ID
   * @property lastGeneratedId
   * @type Number
   */
  lastGeneratedId: 0,

  /**
   * The maximum number of times to try to get an image
   * @property maxTries
   * @type Number
   */
  maxTries: 1,

  /**
   * Volatile property to get a new ID
   * @property newGeneratedId
   * @type String
   */
  newGeneratedId: function () {
    return '-ember-image-cache-' + this.incrementProperty('lastGeneratedId') + '-';
  }.property().volatile(),

  /**
   * Create or get a cache entry given an image src
   *
   * @method cacheEntryFor
   * @param {String} src
   * @returns {ImgCacheEntry}
   */
  cacheEntryFor: function (src) {
    var index = this.get('_cacheEntriesIndex'),
      entries = this.get('_cacheEntries'),
      entry;
    if (src) {
      if (!(entry = index[src])) {
        entry = this.container.lookupFactory('cache-entry:ember-img-cache/core/img-cache-entry').create({src: src});
        index[src] = entry;
        Ember.run.next(entries, 'pushObject', entry);
      }
      return entry;
    }
  },

  /**
   * Observer for the queue length so that the queue processing can be scheduled
   *
   * @method queueLengthDidChange
   */
  queueLengthDidChange: function () {
    if (this.get('queue.length') > 0) {
      Ember.run.scheduleOnce('afterRender', this, 'processQueue');
    }
  }.observes('queue.length'),

  /**
   * Our queue
   * @property queue
   * @type Ember.Array
   */
  queue: function () {
    return Ember.A();
  }.property().readOnly(),

  /**
   * Process the queue (fix placeholders)
   *
   * @method processQueue
   */
  processQueue: function () {
    // we get a copy to avoid the `queueLengthDidChange` observer to fire each time
    var entry, queue = this.get('queue').slice();
    if (queue.length > 0) {
      while ((entry = queue.shift())) {
        entry.fixPlaceholders();
      }
      this.get('queue').clear();
    }
  },

  /**
   * Get a new placeholder for given src and attributes
   *
   * @method placeholderFor
   * @param {String} src
   * @param {Object} [attributes]
   * @returns {String}
   */
  placeholderFor: function (src, attributes) {
    var entry = this.cacheEntryFor(src);
    if (entry) {
      return entry.placeholderFor(attributes);
    }
  }
});

export default ImgManagerService;
