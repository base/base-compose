/*!
 * base-compose <https://github.com/base/base-compose>
 *
 * Copyright (c) 2016, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

var CompositionHandler = require('./lib/composition-handler');

module.exports = function (options) {
  return function(app) {
    this.define('compose', function(arr) {
      return new CompositionHandler(this, arr);
    });
  };
};
