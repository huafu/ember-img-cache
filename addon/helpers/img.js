import Ember from 'ember';

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
  CACHE = Object.create(null);
}

/**
 * Flush the image processing queue
 * __WARNING__: This might leave some `img` without `src` in the DOM
 *
 * @param {Boolean} resetUuid
 */
function flushQueue(resetUuid) {
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
    }
  }
  else {
    entry = Object.create(null);
    entry.src = src;
    entry.hit = 0;
    entry.since = Date.now();
    entry.node = document.createElement('img');
    entry.node.src = src;
    CACHE[src] = entry;
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
  var buffer = '';
  for (var k in attributes) {
    if (attributes.hasOwnProperty(k) && k !== 'src' && (includeId || k !== 'id')) {
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
      img = null;
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
export { img, processQueue, escapeAttr, flushQueue, flush, QUEUE, CACHE };
