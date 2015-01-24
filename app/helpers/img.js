import Ember from 'ember';

/**
 * Our img helper
 *
 * @param {String} src
 * @param {Object} [attributes]
 * @param {Object} options
 * @returns {Handlebars.SafeString}
 */
export function img(src, attributes, options) {
  var manager;
  if (arguments.length === 2) {
    options = attributes;
    attributes = options.hash;
  }
  manager = options.data.view.container.lookup('service:img-manager');
  return manager.placeholderFor(src, attributes).htmlSafe();
}

export default Ember.Handlebars.makeBoundHelper(img);
