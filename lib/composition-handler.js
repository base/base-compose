'use strict';

var utils = require('./utils');

function CompositionHandler(app, arr) {
  if (!(this instanceof CompositionHandler)) {
    return new CompositionHandler(app, arr);
  }

  this.app = app;
  this.iterator = utils.forEach(app, arr);
}

CompositionHandler.prototype.data = function() {
  var data = {};
  this.iterator(function(app, gen) {
    utils.merge(data, gen.cache.data);
  });
  this.app.data(data);
  return this;
};

CompositionHandler.prototype.helpers = function() {
  this.iterator(function(app, gen) {
    app.helpers(gen._.helpers.sync);
    app.asyncHelpers(gen._.helpers.async);
  });
  return this;
};

CompositionHandler.prototype.engines = function() {
  var engines = {};
  this.iterator(function(app, gen) {
    utils.merge(engines, gen.engines);
  });
  utils.merge(this.app.engines, engines);
};

CompositionHandler.prototype.options = function() {
  var options = {};
  this.iterator(function(app, gen) {
    utils.merge(options, gen.options);
  });
  this.app.option(options);
  return this;
};

CompositionHandler.prototype.tasks = function(tasks) {
  tasks = utils.arrayify(tasks);
  this.iterator(function(app, gen) {
    tasks.forEach(function(task) {
      if (!gen.hasTask(task)) return;
      utils.copyTask(gen, app, task);
    });
  });
  return this;
};

CompositionHandler.prototype.views = function() {
  this.iterator(function(app, gen) {
    Object.keys(gen.views).forEach(function(view) {
      if (!gen[view]) return;
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

module.exports = CompositionHandler;
