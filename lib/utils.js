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

/**
 * Arrayify a value.
 *
 * ```js
 * console.log(utils.arrayify('foo'));
 * //=> ['foo']
 * ```
 * @param  {*} `val` Any value. If not an array, will return an array containing that value. If falsey, will return empty array.
 * @return {Array}
 * @api public
 */

utils.arrayify = function(val) {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
};

/**
 * Creates an iterator function that iterators over the specified generators and only calls `fn` on existing generators.
 * Function passed into the iterator will be invoked with the current generator being iterated over (`gen`) and the app passed into
 * the original function. Now binding is done within the iterator so the function passed in can be safely bound.
 *
 * ```js
 * var iterator = utils.createIterator(app, ['a', 'b', 'c']);
 * iterator(function(gen, app) {
 *   // do work
 *   app.data(gen.cache.data);
 * });
 *
 * // optionally, a different array of generator names may be passed as the first argument.
 * iterator(['d', 'e', 'f'], function(gen, app) {
 *   // do work
 * });
 * ```
 *
 * @param  {Object} `app` Application instance that contains the generators to look up.
 * @param  {Array} `generators` Array of generator names to be looked up and iterated over.
 * @return {Function} An iterator function that takes a function to invoke when iterating over generators.
 */

utils.createIterator = function(app, generators) {
  return function(arr, fn) {
    if (typeof arr === 'function') {
      fn = arr;
      arr = null;
    }
    arr = arr ? utils.arrayify(arr) : generators;
    arr.forEach(function(name) {
      var gen = app.getGenerator(name);
      if (!gen) return;
      return fn(gen, app);
    });

    return this;
  };
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
