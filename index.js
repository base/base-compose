/*!
 * base-compose <https://github.com/base/base-compose>
 *
 * Copyright (c) 2016, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var Compose = require('./lib/compose');
var utils = require('./lib/utils');

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
     * app.compose(['a', 'b', 'c'])
     *   .data()
     *   .options()
     *   .helpers()
     *   .views();
     * ```
     *
     * @name .compose
     * @param {String|Array} `names` One or more generator names.
     * @return {Object} Returns an instance of `Compose`
     * @api public
     */

    this.define('compose', function(names) {
      if (!this.isGenerator) {
        throw new Error('expected the base-generators plugin to be registered');
      }
      return new Compose(this, utils.arrayify(names));
    });
  };
};
