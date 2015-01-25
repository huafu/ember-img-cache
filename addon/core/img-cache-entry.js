import Ember from 'ember';
import helpers from './helpers';


var ImgCacheEntry = Ember.Object.extend(Ember.Evented, {
  /**
   * The image src
   * @property src
   * @type String
   */
  src: null,

  /**
   * Our manager, injected
   * @property manager
   * @type ImgManagerService
   */
  manager: null,

  /**
   * All placeholders' id
   * @property placeholders
   * @type Array<String>
   */
  placeholders: function () {
    return [];
  }.property().readOnly(),

  /**
   * The load event handler
   * @property onLoadHandler
   * @type Function
   */
  onLoadHandler: function () {
    return Ember.run.bind(this, function (event) {
      helpers.detach(this.get('node'), 'error', this.get('onErrorHandler'));
      this.set('isError', false);
      this.set('isLoading', false);
      this.trigger('didLoad', event);
    });
  }.property().readOnly(),

  /**
   * The error event handler
   * @property onErrorHandler
   * @type Function
   */
  onErrorHandler: function () {
    return Ember.run.bind(this, function (event) {
      var node = this.get('node');
      helpers.detach(node, 'load', this.get('onLoadHandler'));
      if (this.incrementProperty('errorCount') < this.get('maxTry')) {
        // will get a fresh node object, resulting in re-trying
        this.notifyPropertyChange('src');
        this.get('node');
      }
      else {
        // we're done trying, trigger the `didLoad` event anyway but remove
        // the `src` to avoid the browser loading it again
        this.set('fullSrc', node.src);
        node.removeAttributeNode(node.getAttributeNode('src'));
        this.set('isError', true);
        this.set('isLoading', false);
        this.trigger('didLoad', event);
      }
    });
  }.property().readOnly(),

  /**
   * Our source node which will be used to create clones
   * @property node
   * @type HTMLElement
   */
  node: function () {
    var node, src = this.get('src');
    if (src) {
      this.set('isLoading', true);
      node = document.createElement('img');
      helpers.attachOnce(node, 'load', this.get('onLoadHandler'));
      helpers.attachOnce(node, 'error', this.get('onErrorHandler'));
      node.src = src;
      return node;
    }
  }.property('src').readOnly(),

  /**
   * A volatile property returning a fresh clone of our main node each time it's read
   * @property clone
   * @type HTMLElement
   */
  clone: function () {
    this.incrementProperty('hits');
    return this.get('node').cloneNode();
  }.property().volatile().readOnly(),

  /**
   * Creates a placeholder HTML img and returns its html source
   *
   * @method placeholderFor
   * @param {Object} [attributes]
   * @returns {String}
   */
  placeholderFor: function (attributes) {
    var id, classAdded = false, val, buffer = '<img';
    var loadingClass = this.get('manager.loadingClass');
    id = this.get('manager.newGeneratedId');
    buffer += ' id="' + id + '"';
    id = [id];
    if (attributes) {
      if (attributes.id) {
        id.push(attributes.id);
      }
      for (var k in attributes) {
        if (k !== 'id' && k !== 'src' && k !== 'boundOptions' && attributes.hasOwnProperty(k)) {
          val = attributes[k];
          if (k === 'class') {
            val = (val || '') + ' ' + loadingClass;
            classAdded = true;
          }
          buffer += ' ' + k + '="' + helpers.escapeAttr(attributes[k]) + '"';
        }
      }
    }
    if (!classAdded) {
      buffer += ' class="' + loadingClass + '"';
    }
    buffer += '>';
    this.get('placeholders').pushObject(id);
    this.get('manager.queue').addObject(this);
    return buffer;
  },

  /**
   * Try to replace the existing placeholders, or schedule a replace once the original node has loaded
   *
   * @method fixPlaceholders
   */
  fixPlaceholders: function () {
    var id, placeholder, img, classes, isError, ids = this.get('placeholders');
    if (!ids.length) {
      return;
    }
    if (this.get('isLoading')) {
      this.one('didLoad', this, 'fixPlaceholders');
    }
    else {
      ids = ids.slice();
      isError = this.get('isError');
      classes = this.get('manager').getProperties('loadingClass', 'errorClass', 'successClass');
      this.get('placeholders').clear();
      while (id = ids.shift()) {
        if ((placeholder = document.getElementById(id.shift())).parentNode) {
          img = this.get('clone');
          helpers.moveAttributes(placeholder, img, ['id', 'src']);
          if ((id = id.shift())) {
            img.id = id;
          }
          helpers.replaceClass(img, classes.loadingClass, isError ? classes.errorClass : classes.successClass);
          placeholder.parentNode.replaceChild(img, placeholder);
          if(isError){
            setTimeout(helpers.makeTriggerError(img), 1);
          }
          placeholder = null;
        }
      }
    }
  },

  /**
   * How many times this image has been cloned and used
   * @property hits
   * @type Number
   */
  hits: 0,

  /**
   * Timestamp when this cache entry has been created
   * @property since
   * @type Number
   */
  since: function () {
    return Date.now();
  }.property().readOnly(),

  /**
   * Our initializer
   *
   * @method initImgCacheEntry
   */
  initImgCacheEntry: function () {
    this.getProperties('since', 'node');
  }.on('init'),

  /**
   * The full URL for this source
   * @property fullSrc
   * @type String
   */
  fullSrc: function (key, value) {
    if (arguments.length < 2) {
      value = this.get('node').src;
    }
    return value;
  }.property(),

  /**
   * The number of errors (<= maxTries)
   * @property errorCount
   * @type Number
   */
  errorCount: 0,

  /**
   * The maximum number of times to try to get the image
   * @property maxTries
   * @type Number
   */
  maxTries: Ember.computed.oneWay('manager.maxTries'),

  /**
   * Whether the image is loading or not
   * @property isLoading
   * @type Boolean
   */
  isLoading: true,

  /**
   * Whether it's erroneous
   * @property isError
   * @type Boolean|undefined
   */
  isError: undefined
});


export default ImgCacheEntry;
