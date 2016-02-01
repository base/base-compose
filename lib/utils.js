'use strict';

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);

/**
 * Temporarily re-assign `require` to trick browserify and
 * webpack into reconizing lazy dependencies.
 *
 * This tiny bit of ugliness has the huge dual advantage of
 * only loading modules that are actually called at some
 * point in the lifecycle of the application, whilst also
 * allowing browserify and webpack to find modules that
 * are depended on but never actually called.
 */

var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('copy-task');
require('mixin-deep', 'merge');

/**
 * Restore `require`
 */

require = fn;

utils.arrayify = function(arr) {
  if (!arr) return [];
  return Array.isArray(arr) ? arr : [arr];
};

utils.forEach = function(app, arr) {
  return function(fn) {
    arr.forEach(function(item) {
      var gen = app.getGenerator(item);
      if (!gen) return;
      return fn(app, gen);
    });
  };
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
