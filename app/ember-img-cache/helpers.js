import Ember from 'ember';

var CLASS_SPLIT_REGEXP = /\s+/g;
var ATTRIBUTE_REPLACE_MAP = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};


var helpers = {
  /**
   * Listen for an event on an HTML element
   *
   * @param {HTMLElement} node
   * @param {String} event
   * @param {Function} handler
   * @returns {Boolean}
   */
  attach: function (node, event, handler) {
    if (node.addEventListener) {
      node.addEventListener(event, handler, false);
    }
    else if (node.attachEvent) {
      node.attachEvent('on' + event, handler);
    }
    else {
      return false;
    }
    return true;
  },

  /**
   * Stop listening for an event on an HTML element
   *
   * @param {HTMLElement} node
   * @param {String} event
   * @param {Function} handler
   * @returns {Boolean}
   */
  detach: function (node, event, handler) {
    if (node.removeEventListener) {
      node.removeEventListener(event, handler, true);
    }
    else if (node.detachEvent) {
      node.detachEvent('on' + event, handler);
    }
    else {
      return false;
    }
    return true;
  },

  /**
   * Listen for an HTML event once
   *
   * @param {HTMLElement} node
   * @param {String} event
   * @param {Function} handler
   */
  attachOnce: function (node, event, handler) {
    function wrapper() {
      helpers.detach(node, event, wrapper);
      handler.apply(this, arguments);
    }

    return helpers.attach(node, event, wrapper);
  },


  /**
   * Get the css classes of an element as an array
   *
   * @param {HTMLElement} node
   * @returns {Array<String>}
   */
  classNames: function (node) {
    var classes = (node.className || '').trim().split(CLASS_SPLIT_REGEXP);
    if (classes.length === 1 && classes[0] === '') {
      classes = [];
    }
    return classes;
  },

  /**
   * Add a class name to the list of classes if it is not there already
   *
   * @param {HTMLElement} node
   * @param {String} className
   * @chainable
   */
  addClass: function (node, className) {
    var classes = helpers.classNames(node);
    classes.pushObject(className);
    node.className = classes.join(' ');
    return this;
  },

  /**
   * Replace a css class by another one for the given node
   *
   * @param {HTMLElement} node
   * @param {String} oldClassName
   * @param {String} newClassName
   * @chainable
   */
  replaceClass: function (node, oldClassName, newClassName) {
    node.className = helpers.classNames(node).without(oldClassName).concat(
      newClassName ? [newClassName] : []
    ).join(' ');
    return this;
  },


  /**
   * Escape an HTML attribute value
   * TODO: replace with Ember helper if there is one and if it runs faster
   *
   * @param str
   * @returns {String}
   */
  escapeAttr: function (str) {
    if (str === null || str === undefined) {
      str = '';
    }
    else {
      str = '' + str;
    }
    return str.replace(/[&<>'"]/g, function (c) {
      return ATTRIBUTE_REPLACE_MAP[c];
    });
  },

  /**
   * Move attributes from one node to another, excluding those in the `exclude` array
   *
   * @param {HTMLElement} sourceNode
   * @param {HTMLElement} destinationNode
   * @param {Array} exclude
   * @chainable
   */
  moveAttributes: function (sourceNode, destinationNode, exclude) {
    var attributes = [], attr, i;
    exclude = exclude || [];
    for (i = 0; i < sourceNode.attributes.length; i++) {
      attr = sourceNode.attributes[i];
      if (exclude.indexOf(attr.localName) < 0) {
        attributes.push(attr);
      }
    }
    for (i = 0; i < attributes.length; i++) {
      attr = sourceNode.removeAttributeNode(attributes[i]);
      destinationNode.setAttributeNode(attr);
    }
    return this;
  },

  /**
   * Creates a function which would trigger the error event on the given node if called
   *
   * @method makeTriggerError
   * @param {HTMLElement} node
   * @returns {Function}
   */
  makeTriggerError: function (node) {
    if (!node.dispatchEvent) {
      return Ember.K;
    }
    return function () {
      var event = new Event('error', {bubbles: false, cancelable: false});
      node.dispatchEvent(event);
    };
  }

};

export default helpers;
