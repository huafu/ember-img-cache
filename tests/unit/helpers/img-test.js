import {
  NAMESPACE, CACHE, QUEUE, flush, flushQueue, processQueue, img, escapeAttr
  } from 'ember-img-cache/helpers/img';
import Ember from 'ember';

module('ImgHelper', {
  //setup: function () {
  //
  //},
  teardown: function () {
    flush();
    flushQueue(true);
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

function appendImg(src, attributes) {
  var html = img(src, {hash: attributes}).toString();
  Ember.$('#qunit-fixture').append(html);
  return html;
}
function getHtml() {
  return Ember.$('#qunit-fixture').html();
}
function assertQueueLength(itemCount, msg) {
  strictEqual(QUEUE.length, itemCount * 3, msg || 'there should be ' + itemCount + ' item(s) in the queue');
}
function assertInCache(src, nb) {
  ok(CACHE[src] && CACHE[src].node, 'there should be a cache entry for `' + src + '`');
  if (arguments.length > 1) {
    strictEqual(CACHE[src].hit, nb || 0, 'the cache hit should be correct');
  }
}
function assertNotInCache(src, msg) {
  ok(!CACHE[src], msg || 'there should not be a cache entry for `' + src + '`');
}
function imgTag(src, attr, id) {
  var attrs = '';
  for (var k in attr || {}) {
    attrs += ' ' + k.toLowerCase() + '="' + escapeAttr(attr[k]) + '"';
  }
  if (id) {
    attrs += ' id="' + NAMESPACE + id + '"';
  }
  return '<img' + (src ? ' src="' + escapeAttr(src) + '"' : '') + attrs + '>';
}

/**********************************************************
 *                                                        *
 *                         TESTS                          *
 *                                                        *
 *********************************************************/

test('it renders a placeholder when the image is in cache and replaces it with a clone of the cache', function () {
  Ember.run(function () {
    assertNotInCache(SRC);
    appendImg(SRC, {alt: 'test'});
    assertInCache(SRC, 0);
    appendImg(SRC, {title: 'test'});
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
    imgTag(SRC, {alt: 'test'}) + imgTag(SRC, {title: 'test'}),
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
      imgTag(SRC_DATA, {id: 'test1'}) + imgTag(SRC_LOCAL, {id: 'test2'}) + imgTag(null, null, 1),
      'the html should contain images with correct `id`'
    );
  });
  strictEqual(
    getHtml(),
    imgTag(SRC_DATA, {id: 'test1'}) + imgTag(SRC_LOCAL, {id: 'test2'}) + imgTag(SRC, {id: 'test3'}),
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
      imgTag(SRC_DATA, {'data-one': 'one'}) + imgTag(SRC_LOCAL, {'randomAttr': 'random'}) + imgTag(null, {'dummy': 'dummy'}, 1),
      'the html should contain images with correct attributes'
    );
  });
  strictEqual(
    getHtml(),
    imgTag(SRC_DATA, {'data-one': 'one'}) + imgTag(SRC_LOCAL, {'randomAttr': 'random'}) + imgTag(SRC, {'dummy': 'dummy'}),
    'the html should still contain images with correct attributes'
  );
});
