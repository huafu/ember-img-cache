import Ember from 'ember';

function makeMatcher(match) {
  switch (typeof match) {
    case 'string':
      return function (src) {
        return match.indexOf(src) !== -1;
      };
    case 'regexp':
      return function (src) {
        return match.test(src);
      };
    case 'function':
      return match;
    default:
      throw new Error('Wrong img-cache rule matcher: ' + match);
  }
}

function Rule(config) {
  if (typeof config !== 'object' || !config.match) {
    throw new Error('An img-cache rule must be an object with at least the `match` property.');
  }
  this.match = makeMatcher(config.match);
  this.batchSize = config.batchSize || 1;
  this.delay = config.delay || 1;
  this.readyListeners = [];
  this.maxTries = config.maxTries;
  this._timer = null;
}

Rule.prototype.pushReadyHandler = function (handler) {
  this.readyListeners.push(handler);
  this.process();
};

Rule.prototype.process = function () {
  var _this = this;
  if (this._timer || !this.readyListeners.length) {
    return;
  }
  this._timer = setTimeout(function () {
    var batch = _this.readyListeners.splice(0, _this.batchSize || _this.readyListeners.length);
    for (var i = 0; i < batch; i++) {
      try {
        batch[i]();
      }
      catch (e) {
        Ember.warn('[img-cache] ' + e);
      }
    }
    _this._timer = null;
    if (_this.readyListeners.length) {
      _this.process();
    }
  }, this.delay);
};


export default Rule;
