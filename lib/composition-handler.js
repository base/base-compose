'use strict';

var utils = require('./utils');

/**
 * Create a new instance of the CompositionHandler for the given app and list of generators.
 *
 * ```js
 * var handler = new CompositionHandler(app, ['a', 'b', 'c']);
 * ```
 *
 * @param {Object} `app` Application instance containing generators.
 * @param {Array} `generators` Array of generators to be iterated over.
 */

function CompositionHandler(app, generators) {
  this.app = app;
  this.generators = utils.arrayify(generators);
}

/**
 * Merge the `cache.data` object from each generator onto the `app.cache.data` object.
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
 *
 * @return {Object} Returns `this` for chaining
 * @api public
 */

CompositionHandler.prototype.data = function() {
  var data = {};
  this.iterator(function(gen, app) {
    utils.merge(data, gen.cache.data);
  });
  this.app.data(data);
  return this;
};

/**
 * Merge the engines from each generator into the `app` engines.
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
  var engines = {};
  this.iterator(function(gen, app) {
    utils.merge(engines, gen.engines);
  });
  utils.merge(this.app.engines, engines);
};

/**
 * Merge the helpers from each generator into the `app` helpers.
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
  this.iterator(function(gen, app) {
    app.helpers(gen._.helpers.sync);
    app.asyncHelpers(gen._.helpers.async);
  });
  return this;
};

/**
 * Merge the options from each generator into the `app` options.
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
 *
 * @return {Object} Returns `this` for chaining
 * @api public
 */

CompositionHandler.prototype.options = function() {
  var options = {};
  this.iterator(function(gen, app) {
    utils.merge(options, gen.options);
  });
  this.app.option(options);
  return this;
};

/**
 * Copy the specified tasks from each generator into the `app` tasks.
 * Task dependencies will also be copied.
 *
 * ```js
 * app.compose(['a', 'b', 'c'])
 *   .tasks(['foo', 'bar', 'default']);
 * ```
 *
 * @return {Object} Returns `this` for chaining
 * @api public
 */

CompositionHandler.prototype.tasks = function(tasks) {
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
 *
 * ```js
 * app.compose(['a', 'b', 'c'])
 *   .views();
 * ```
 *
 * @return {Object} Returns `this` for chaining
 * @api public
 */

CompositionHandler.prototype.views = function() {
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
 *
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
