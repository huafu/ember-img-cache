import Ember from 'ember';
import helpers from './helpers';

export var MISSING_IMAGE_SRC = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAUCAMAAAC3SZ14AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5MDE0RENFRjU2QTAxMUU0ODgxRTlDMkYxQzMyQkY0RSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5MDE0RENGMDU2QTAxMUU0ODgxRTlDMkYxQzMyQkY0RSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjkwMTREQ0VENTZBMDExRTQ4ODFFOUMyRjFDMzJCRjRFIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjkwMTREQ0VFNTZBMDExRTQ4ODFFOUMyRjFDMzJCRjRFIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+XY86OAAAAYBQTFRFxdf1xtf2wtT0xNX0xdb1wtP0wNPzzd/6zt/7vtDxyNj2wNLxzN35y9v53OTzytr42Ob90+H46vH/VbAx1eP9XLE+8vb9icKPudHmrMnVssrioMe70t/10d/5abVXX7JGt9Dh3en+ebxyy9z3r87V/v7/t8rqv9rf0eL9VbAw////oqKiqamprKysu7u7vLy8vb29v7+/wcHBw8PDxMTExcXFxsbGx8fHyMjIysrKy8vLzc3Nzs7Oz8/P0NDQ0dHR09PT1NTU1dXV1tbW2NjY2dnZ3Nzc3d3d3t7e4ODg4eHh4+Pj5OTk5ubm6Ojo7Ozs7u7u7+/v8vLy9vb2+Pj4+/v7nJyd2OX9dHR1zt/66PD+l5eXyNv30uL9zd756urqvM7v+vr6o6Ojydv3+Pj51uT9+fn5lJSVuszvvM7wioqLiIiJ2ef9h4eI1+X9+vr7mJiZ+vv+2uf9lZWWjo6P2uX62eb9iYmKuMvtjIyNkpKTmpqb0+P9lpaX3+n7m5ucJBI9jQAAARJJREFUeNpUzm1PglAUwHGQhwWDDEyBMswaJXczBCTTBSIIS4wUJr3kY/T5OxfpRf83d/vt7J5D2DPrfzYx2xXHtqI8QCvCKsPVe5PvJQgKCOu4/LlqGkdOCuRjuqhrQajriZp/bP9IlGRZEiZqhtKkoTdRGCAkd2vqZb6YHkKgBRaEJF6Qhtf3nxug17sBJD+SPM+LLfEdCqIJqHuzx+Q1RNPY2csTvmtOsmyHZFiyw3KS0Wx0KY5RFV1XVG5onO9yGUbTTaj/bKD9FxxROIw2wmI+nJCs7fD3DqefpUI511DhKa1UiXn7lAGV034PgpmgZ46+swgo3yYQ7MriNE2rNWEvwyiOonjt+xt4o8D9FWAAjMY+R8SyaIYAAAAASUVORK5CYII=';


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
  placeholders: Ember.computed(function () {
    return [];
  }).readOnly(),

  /**
   * The load event handler
   * @property onLoadHandler
   * @type Function
   */
  onLoadHandler: Ember.computed(function () {
    return Ember.run.bind(this, function (event) {
      helpers.detach(this.get('node'), 'error', this.get('onErrorHandler'));
      this.set('isError', false);
      this.set('isLoading', false);
      this.trigger('didLoad', event);
      this.trigger('ready', event);
    });
  }).readOnly(),

  /**
   * The error event handler
   * @property onErrorHandler
   * @type Function
   */
  onErrorHandler: Ember.computed(function () {
    return Ember.run.bind(this, function (event) {
      var node = this.get('node');
      helpers.detach(node, 'load', this.get('onLoadHandler'));
      if (this.incrementProperty('errorCount') < this.get('maxTry')) {
        this.manager.scheduleLoadRetry(this.get('src'), this, function () {
          // will get a fresh node object, resulting in re-trying
          this.notifyPropertyChange('src');
          this.get('node');
        });
      }
      else {
        // we're done trying, trigger the `didError` event and remove
        // the `src` to avoid the browser loading it again
        this.set('fullSrc', node.src);
        //node.removeAttributeNode(node.getAttributeNode('src'));
        node.src = MISSING_IMAGE_SRC;
        this.set('isError', true);
        this.set('isLoading', false);
        this.trigger('didError', event);
        this.trigger('ready', event);
      }
    });
  }).readOnly(),

  /**
   * The rule for this image
   * @property rule
   * @type {Rule}
   */
  rule: Ember.computed('manager.rules', 'fullSrc', function(){
    return this.manager.ruleFor(this.get('fullSrc'));
  }).readOnly(),


  /**
   * Our source node which will be used to create clones
   * @property node
   * @type HTMLElement
   */
  node: Ember.computed('src', function () {
    var node, src = this.get('src');
    if (src) {
      this.set('isLoading', true);
      node = document.createElement('img');
      helpers.attachOnce(node, 'load', this.get('onLoadHandler'));
      helpers.attachOnce(node, 'error', this.get('onErrorHandler'));
      node.src = src;
      return node;
    }
  }).readOnly(),

  /**
   * A volatile property returning a fresh clone of our main node each time it's read
   * @property clone
   * @type HTMLElement
   */
  clone: Ember.computed(function () {
    this.incrementProperty('hits');
    return this.get('node').cloneNode();
  }).volatile().readOnly(),

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
      this.one('ready', this, 'fixPlaceholders');
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
          if (isError) {
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
  since: Ember.computed(function () {
    return Date.now();
  }).readOnly(),

  /**
   * Our initializer
   *
   * @method initImgCacheEntry
   */
  initImgCacheEntry: Ember.on('init', function () {
    this.get('since', 'node');
  }),

  /**
   * The full URL for this source
   * @property fullSrc
   * @type String
   */
  fullSrc: Ember.computed(function (key, value) {
    if (arguments.length < 2) {
      value = this.get('node').src;
    }
    return value;
  }),

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
  maxTries: Ember.computed.any('rule.maxTries', 'manager.maxTries'),

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
