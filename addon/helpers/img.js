import Ember from 'ember';

/******************************************************************************
 *                                                                            *
 * For faster processing, this helper does NOT use jQuery. Any HTML related   *
 * operations are made with native functions so that it does it as fast as    *
 * possible.                                                                  *
 *                                                                            *
 *****************************************************************************/

/**
 * CSS class name to be used on img nodes which are errors
 * @type {String}
 */
var ERROR_CLASS = '-eic-error';
/**
 * CSS class name to be used on img nodes which are successfully loaded
 * @type {String}
 */
var SUCCESS_CLASS = '-eic-success';
/**
 * CSS class name to be used on img nodes which are loading
 * @type {String}
 */
var LOADING_CLASS = '-eic-loading';

/**
 * Holds the image cache
 * @type Object
 */
var CACHE = Object.create(null);

/**
 * Holds the processing image queue
 * @type Array<String|Number>
 */
var QUEUE = [];

/**
 * Flush the image cache
 */
function flush() {
  Ember.debug('[img-cache] flushing the cache');
  CACHE = Object.create(null);
}

/**
 * Flush the image processing queue
 * __WARNING__: This might leave some `img` without `src` in the DOM
 *
 * @param {Boolean} resetUuid
 */
function flushQueue(resetUuid) {
  Ember.debug('[img-cache] flushing the queue');
  QUEUE.splice(0, QUEUE.length);
  if (resetUuid) {
    uuid = 0;
  }
}

/**
 * Keep a unique ID to give to our elements
 * @type Number
 */
var uuid = 0;

/**
 * Prefix for our generated image IDs
 * @type String
 */
export var NAMESPACE = '-ember-img-cache';


var MAP = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};

/**
 * Escape an HTML attribute value
 * TODO: replace with Ember helper if there is one and if it runs faster
 *
 * @param str
 * @returns {String}
 */
function escapeAttr(str) {
  if (str === null || str === undefined) {
    str = '';
  }
  else {
    str = '' + str;
  }
  return str.replace(/[&<>'"]/g, function (c) {
    return MAP[c];
  });
}

/**
 * Adds a css class on the given node
 *
 * @param {HTMLImageElement} node
 * @param {String} className
 */
function addClass(node, className) {
  node.className = (node.className || '').split(/\s+/g).without(className).concat([className]).join(' ').trim();
}

/**
 * Removes a css class on the given node
 *
 * @param {HTMLImageElement} node
 * @param {String} className
 */
function removeClass(node, className) {
  node.className = (node.className || '').split(/\s+/g).without(className).join(' ').trim();
}

/**
 * Listen for an HTML event once
 *
 * @param {HTMLElement} node
 * @param {String} event
 * @param {Function} handler
 */
function listenOnce(node, event, handler) {
  function wrapper() {
    if (node.removeEventListener) {
      node.removeEventListener(event, wrapper, true);
    }
    else if (node.detachEvent) {
      node.detachEvent('on' + event, wrapper);
    }
    handler.apply(this, arguments);
  }

  if (node.addEventListener) {
    node.addEventListener(event, wrapper, false);
  }
  else if (node.attachEvent) {
    node.attachEvent('on' + event, wrapper);
  }
  else {
    return false;
  }
  return true;
}

/**
 * Get or creates a cache entry, incrementing the `hit` property if necessary
 *
 * @param {String} src
 * @param {Boolean} updateHit
 * @returns {Object}
 */
function cacheEntry(src, updateHit) {
  var entry = CACHE[src];
  if (entry) {
    if (updateHit) {
      entry.hit++;
      //Ember.debug('[img-cache] cache hit for %@'.fmt(src));
    }
  }
  else {
    entry = Object.create(null);
    entry.src = src;
    entry.hit = 0;
    entry.since = Date.now();
    entry.node = document.createElement('img');
    entry.node.src = src;
    listenOnce(entry.node, 'error', function () {
      entry.node.removeAttribute('src');
      entry.error = true;
    });
    listenOnce(entry.node, 'load', function () {
      entry.error = false;
    });
    CACHE[src] = entry;
    //Ember.debug('[img-cache] created and cached new img node for %@'.fmt(src));
  }
  return entry;
}

/**
 * Serialize HTML attributes into a string that can be used inside an HTML tag
 *
 * @param {Object} attributes
 * @param {Boolean} includeId
 * @param {Boolean} includeSrc
 * @returns {String}
 */
function serializeAttributes(attributes, includeId) {
  var buffer = '', name;
  for (var k in attributes) {
    name = k.toLowerCase();
    if (attributes.hasOwnProperty(k) && name !== 'src' && name !== 'boundoptions' && (includeId || name !== 'id')) {
      buffer += ' ' + k + '="' + escapeAttr(attributes[k]) + '"';
    }
  }
  return buffer;
}

/**
 * Import HTML attributes from one node to another
 *
 * @param {HTMLElement} srcNode
 * @param {HTMLElement} dstNode
 */
function importAttributes(srcNode, dstNode) {
  var i, attr, attributes = [];
  for (i = 0; i < srcNode.attributes.length; i++) {
    attr = srcNode.attributes[i];
    if (attr.name !== 'src' && attr.name !== 'id') {
      attributes.push(attr);
    }
  }
  for (i = 0; i < attributes.length; i++) {
    attr = attributes[i];
    srcNode.removeAttributeNode(attr);
    dstNode.setAttributeNode(attr);
  }
}

/**
 * Generates a placeholder `img` to be used in the HTML (no `src`)
 *
 * @param {String} src
 * @param {Object} attributes
 * @param {Boolean} includeSrc
 * @returns {String}
 */
function placeholder(src, attributes, includeSrc) {
  var html = '<img';
  if (includeSrc) {
    html += ' src="' + escapeAttr(src) + '"';
  }
  html += serializeAttributes(attributes) + ' id="' + NAMESPACE + uuid + '"';
  return html + '>';
}

/**
 * Enqueue an image for replacement with one from the cache
 *
 * @param {String} src
 * @param {Object} attributes
 * @returns {String}
 */
function enqueue(src, attributes) {
  if (QUEUE.length === 0) {
    Ember.run.scheduleOnce('afterRender', processQueue);
  }
  QUEUE.push(++uuid, attributes.id, src);
  cacheEntry(src);
  return placeholder(src, attributes);
}

/**
 * Process the queue of images to be replaced or cached
 */
function processQueue() {
  var id, originalId, img, entry, newImg, src;

  function makeAddClass(node, className) {
    return function () {
      removeClass(node, LOADING_CLASS);
      addClass(node, className);
    };
  }

  while (QUEUE.length) {
    src = QUEUE.pop();
    originalId = QUEUE.pop();
    id = NAMESPACE + QUEUE.pop();
    img = document.getElementById(id);
    if (img) {
      entry = cacheEntry(src, true);
      newImg = entry.node.cloneNode();
      // import attributes from the source node
      importAttributes(img, newImg);
      if (originalId !== undefined) {
        newImg.id = originalId;
      }
      img.parentNode.replaceChild(newImg, img);
      if (entry.error === undefined) {
        addClass(newImg, LOADING_CLASS);
        listenOnce(newImg, 'error', makeAddClass(newImg, ERROR_CLASS));
        listenOnce(newImg, 'load', makeAddClass(newImg, SUCCESS_CLASS));
      }
      else {
        addClass(newImg, entry.error ? ERROR_CLASS : SUCCESS_CLASS);
      }
      img = null;
      //Ember.debug('[img-cache] replaced placeholder with clone from cache for %@'.fmt(src));
    }
  }
}

/**
 * Our main helper
 *
 * @param {String} src
 * @param {Object} options
 * @returns {Handlebars.SafeString}
 */
function img(src, options) {
  var attributes = options && options.hash || {}, html;
  if (src && ['file:', 'data:'].indexOf(src.substr(0, 5)) < 0) {
    html = enqueue(src, attributes);
  }
  else {
    html = '<img src="' + escapeAttr(src) + '"' + serializeAttributes(attributes, true) + '>';
  }
  return html.htmlSafe();
}

export default Ember.Handlebars.makeBoundHelper(img);
export {
  img, processQueue, escapeAttr, flushQueue, flush,
  QUEUE, CACHE, ERROR_CLASS, SUCCESS_CLASS, LOADING_CLASS
  };
