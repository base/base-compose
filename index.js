/*!
 * base-compose <https://github.com/base/base-compose>
 *
 * Copyright (c) 2016, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var CompositionHandler = require('./lib/composition-handler');

/**
 * Expose `compose`
 */

module.exports = function(options) {
  return function(app) {

    /**
     * Setup a composition by passing in an array of generators to compose elements.
     * If a generator cannot be found, an error will be thrown.
     *
     * ```js
     * var composition = app.compose(['a', 'b', 'c']);
     *
     * // most of the time, use chaining
     * app.compose(['a', 'b', 'c'])
     *   .data()
     *   .options()
     *   .views();
     * ```
     *
     * @name .compose
     * @param {Array} `generators` Array of generators to be composed.
     * @return {Object} Instance of [CompositionHandler](#composition-handler-api)
     * @api public
     */

    this.define('compose', function(arr) {
      if (typeof this.getGenerator !== 'function') {
        throw new Error('.compose expects an "app" using the "base-generators" plugin');
      }
      return new CompositionHandler(this, arr);
    });
  };
};
