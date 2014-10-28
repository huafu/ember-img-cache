import Ember from 'ember';

/**
 * Our img helper
 *
 * @param {String} src
 * @param {Object} options
 * @returns {Handlebars.SafeString}
 */
export function img(src, options) {
  var view = options.data.view;
  return view.container.lookup('service:ember-img-cache/services/img-manager')
    .placeholderFor(src, options.hash).htmlSafe();
}

export default Ember.Handlebars.makeBoundHelper(img);
