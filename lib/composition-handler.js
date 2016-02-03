'use strict';

var utils = require('./utils');

/**
 * Create a new instance of the CompositionHandler for the given app and list of generators.
 *
 * ```js
 * var handler = new CompositionHandler(app, ['a', 'b', 'c']);
 * ```
 * @param {Object} `app` Application instance containing generators.
 * @param {Array} `generators` Array of generators to be iterated over.
 */

function CompositionHandler(app, generators) {
  this.app = app;
  this.generators = utils.arrayify(generators);
}

/**
 * Merge the `cache.data` object from each generator onto the `app.cache.data` object.
 * This method requires the `.data()` method from [templates].
 *
 * ```js
 * a.data({foo: 'a'});
 * b.data({foo: 'b'});
 * c.data({foo: 'c'});
 *
 * app.compose(['a', 'b', 'c'])
 *   .data();
 *
 * console.log(app.cache.data);
 * //=> {foo: 'c'}
 * ```
 * @param {String} `key` Optionally pass a key to merge from the `data` object.
 * @return {Object} Returns `this` for chaining
 * @api public
 */

CompositionHandler.prototype.data = function(key) {
  if (typeof this.app.data !== 'function') {
    throw new Error('.data expects a ".data()" method on "app"');
  }
  var data = {};
  this.iterator(function(gen, app) {
    utils.merge(data, key ? gen.data(key) : gen.cache.data);
  });
  if (key) {
    this.app.data(key, data);
  } else {
    this.app.data(data);
  }
  return this;
};

/**
 * Merge the engines from each generator into the `app` engines.
 * This method requires the `.engine()` methods from [templates].
 *
 * ```js
 * app.compose(['a', 'b', 'c'])
 *   .engines();
 * ```
 *
 * @return {Object} Returns `this` for chaining
 * @api public
 */

CompositionHandler.prototype.engines = function() {
  if (typeof this.app.engine !== 'function') {
    throw new Error('.engines expects an ".engine()" method on "app"');
  }
  var engines = {};
  this.iterator(function(gen, app) {
    utils.merge(engines, gen.engines);
  });
  utils.merge(this.app.engines, engines);
};

/**
 * Merge the helpers from each generator into the `app` helpers.
 * This method requires the `.helper` method from [templates].
 *
 * ```js
 * app.compose(['a', 'b', 'c'])
 *   .helpers();
 * ```
 *
 * @return {Object} Returns `this` for chaining
 * @api public
 */

CompositionHandler.prototype.helpers = function() {
  if (typeof this.app.helper !== 'function') {
    throw new Error('.helpers expects a ".helper()" method on "app"');
  }
  this.iterator(function(gen, app) {
    app.helpers(gen._.helpers.sync);
    app.asyncHelpers(gen._.helpers.async);
  });
  return this;
};

/**
 * Merge the options from each generator into the `app` options.
 * This method requires using the [base-option][base-option] plugin.
 *
 * ```js
 * a.option({foo: 'a'});
 * b.option({foo: 'b'});
 * c.option({foo: 'c'});
 *
 * app.compose(['a', 'b', 'c'])
 *   .options();
 *
 * console.log(app.options);
 * //=> {foo: 'c'}
 * ```
 * @param {String} `key` Optionally pass a key to merge from the `options` object.
 * @return {Object} Returns `this` for chaining
 * @api public
 */

CompositionHandler.prototype.options = function(key) {
  if (typeof this.app.option !== 'function') {
    throw new Error('.options expects an ".option()" method from "base-option" on "app"');
  }
  var options = {};
  this.iterator(function(gen, app) {
    utils.merge(options, key ? gen.option(key) : gen.options);
  });
  if (key) {
    this.app.option(key, options);
  } else {
    this.app.option(options);
  }
  return this;
};

/**
 * Copy the specified tasks from each generator into the `app` tasks.
 * Task dependencies will also be copied.
 * This method requires using the [base-task][base-task] plugin.
 *
 * ```js
 * app.compose(['a', 'b', 'c'])
 *   .tasks(['foo', 'bar', 'default']);
 * ```
 * @return {Object} Returns `this` for chaining
 * @api public
 */

CompositionHandler.prototype.tasks = function(tasks) {
  if (typeof this.app.task !== 'function') {
    throw new Error('.tasks expects a ".task()" method from "base-task" on "app"');
  }
  tasks = utils.arrayify(tasks);
  this.iterator(function(gen, app) {
    tasks.forEach(function(task) {
      utils.copyTask(gen, app, task);
    });
  });
  return this;
};

/**
 * Copy the view collections and loaded views from each generator to the `app`.
 * This method requires using an "app" inherited from [templates].
 *
 * ```js
 * app.compose(['a', 'b', 'c'])
 *   .views();
 * ```
 * @return {Object} Returns `this` for chaining
 * @api public
 */

CompositionHandler.prototype.views = function() {
  if (typeof this.app.create !== 'function') {
    throw new Error('.views expects the "app" to be inherited from "templates"');
  }
  this.iterator(function(gen, app) {
    Object.keys(gen.views).forEach(function(view) {
      if (!app[view]) {
        var collection = gen[view];
        app.create(collection.options.inflection, collection.options);
      }
      var views = gen.views[view];
      app.templates(views);
    });
  });
  return this;
};

/**
 * Iterates over the specified generators and only calls `fn` on existing generators.
 * Function passed into the iterator will be invoked with the current generator being iterated over (`gen`) and the app passed into
 * the original function. No binding is done within the iterator so the function passed in can be safely bound.
 *
 * ```js
 * app.compose(['a', 'b', 'c'])
 *   .iterator(function(gen, app) {
 *     // do work
 *     app.data(gen.cache.data);
 *   });
 *
 * // optionally, a different array of generator names may be passed as the first argument.
 * app.compose(['a', 'b', 'c'])
 *   .iterator(['d', 'e', 'f'], function(gen, app) {
 *     // do work
 *   });
 * ```
 * @name iterator
 * @param  {Array} `generators` Optional array of generator names to be looked up and iterated over.
 * @param  {Function} `fn` Function invoked with generator currently being iterated over and the app.
 * @return {Object} Returns `this` for chaining
 * @api public
 */

CompositionHandler.prototype.iterator = function() {
  return utils.createIterator(this.app, this.generators)
    .apply(this, arguments);
};

/**
 * Expose `CompositionHandler`
 */

module.exports = CompositionHandler;
