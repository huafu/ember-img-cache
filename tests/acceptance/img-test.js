import '../helpers/helpers';
import startApp from '../helpers/start-app';
import Ember from 'ember';
import helpers from '../../app/ember-img-cache/helpers';

var App, view, manager;

module('ImgHelper', {
  setup:    function () {
    App = startApp();
    visit('/');
    andThen(function () {
      manager = lookup('service:img-manager');
    });
  },
  teardown: function () {
    manager = null;
    Ember.run(view, 'destroy');
    Ember.run(App, 'destroy');
    $('#qunit-fixture').html('');
  }
});

/**********************************************************
 *                                                        *
 *                     MODULE HELPERS                     *
 *                                                        *
 *********************************************************/
var SRC = 'assets/test.png';
var SRC_DATA = 'data:image/png;dummy';
var SRC_LOCAL = 'file:///dummy';

function appendImg(code, viewProperties) {
  var $el = Ember.$('#qunit-fixture');
  view = Ember.View.extend({
    container: App.__container__,
    template: Ember.Handlebars.compile(code)
  }).create(viewProperties || {});
  view.appendTo($el);
  Ember.run.sync();
  return getHtml();
}
function getHtml() {
  return view.$().html();
}
function assertQueueLength(itemCount, msg) {
  strictEqual(manager.get('queue.length'), itemCount, msg || 'there should be ' + itemCount + ' item(s) in the queue');
}
function cacheEntry(src){
  return manager.get('_cacheEntriesIndex')[src];
}
function assertInCache(src, nb) {
  ok(cacheEntry(src), 'there should be a cache entry for `' + src + '`');
  if (arguments.length > 1) {
    strictEqual(cacheEntry(src).get('hits'), nb || 0, 'the cache hit count should be correct');
  }
}
function assertNotInCache(src, msg) {
  ok(!cacheEntry(src), msg || 'there should not be a cache entry for `' + src + '`');
}
function imgTag(src, attr, id, cssClass) {
  var attrs = '';
  for (var k in attr || {}) {
    attrs += ' ' + k.toLowerCase() + '="' + helpers.escapeAttr(attr[k]) + '"';
  }
  if (id) {
    attrs += ' id="-ember-image-cache-' + id + '-"';
  }
  if (cssClass) {
    attrs += ' class="' + cssClass + '"';
  }
  return '<img' + (src ? ' src="' + helpers.escapeAttr(src) + '"' : '') + attrs + '>';
}

/**********************************************************
 *                                                        *
 *                         TESTS                          *
 *                                                        *
 *********************************************************/

test('it renders a placeholder when the image is in cache and replaces it with a clone of the cache', function () {
  Ember.run(function () {
    assertNotInCache(SRC);
    appendImg('{{img view.src alt=view.alt}}', {src: SRC, alt: 'test'});
    assertInCache(SRC, 0);
    appendImg('{{img view.src title=view.title}}', {src: SRC, title: 'test'});
    assertInCache(SRC, 0);
    assertQueueLength(2);
    strictEqual(
      getHtml(),
      imgTag(null, {alt: 'test'}, 1) + imgTag(null, {title: 'test'}, 2),
      'the html should now contain placeholders with correct `id`'
    );
  });
  // processQueue should have been run
  assertQueueLength(0);
  assertInCache(SRC, 2);
  strictEqual(
    getHtml(),
    imgTag(SRC, {alt: 'test'}, null, manager.get('loadingClass')) + imgTag(SRC, {title: 'test'}, null, manager.get('loadingClass')),
    'the html should now contain original source without `id`'
  );
});

test('it does not try to cache `img` with no `src` or local `src`', function () {
  Ember.run(function () {
    appendImg(SRC_DATA, {alt: 'test'});
    assertNotInCache(SRC_DATA);
    appendImg(SRC_LOCAL, {title: 'test'});
    assertNotInCache(SRC_LOCAL);
    assertQueueLength(0);
    strictEqual(
      getHtml(),
      imgTag(SRC_DATA, {alt: 'test'}) + imgTag(SRC_LOCAL, {title: 'test'}),
      'the html should now contain correct images directly'
    );
  });
  strictEqual(
    getHtml(),
    imgTag(SRC_DATA, {alt: 'test'}) + imgTag(SRC_LOCAL, {title: 'test'}),
    'the html should still contain correct images directly'
  );
});

test('it keeps the id property if one defined', function () {
  Ember.run(function () {
    appendImg(SRC_DATA, {id: 'test1'});
    appendImg(SRC_LOCAL, {id: 'test2'});
    appendImg(SRC, {id: 'test3'});
    strictEqual(
      getHtml(),
      imgTag(SRC_DATA, {id: 'test1'}) +
      imgTag(SRC_LOCAL, {id: 'test2'}) +
      imgTag(null, null, 1),
      'the html should contain images with correct `id`'
    );
  });
  strictEqual(
    getHtml(),
    imgTag(SRC_DATA, {id: 'test1'}) +
    imgTag(SRC_LOCAL, {id: 'test2'}) +
    imgTag(SRC, {id: 'test3'}, null, manager.get('loadingClass')),
    'the html should now contain images with replaced `id`'
  );
});


test('it keeps user-defined attributes', function () {
  Ember.run(function () {
    appendImg(SRC_DATA, {'data-one': 'one'});
    appendImg(SRC_LOCAL, {'randomAttr': 'random'});
    appendImg(SRC, {'dummy': 'dummy'});
    strictEqual(
      getHtml(),
      imgTag(SRC_DATA, {'data-one': 'one'}) +
      imgTag(SRC_LOCAL, {'randomAttr': 'random'}) +
      imgTag(null, {'dummy': 'dummy'}, 1),
      'the html should contain images with correct attributes'
    );
  });
  strictEqual(
    getHtml(),
    imgTag(SRC_DATA, {'data-one': 'one'}) + imgTag(SRC_LOCAL, {'randomAttr': 'random'}) +
    imgTag(SRC, {'dummy': 'dummy'}, null, manager.get('loadingClass')),
    'the html should still contain images with correct attributes'
  );
});
