'use strict';

require('mocha');
var assert = require('assert');
var Base = require('assemble-core');
var generators = require('base-generators');
Base.use(generators());

var plugin = require('../');
var app;


describe('base-compose', function() {
  beforeEach(function() {
    app = new Base();
    app.use(plugin());
  });

  it('should add `.compose` method to `app`', function() {
    assert.equal(typeof app.compose, 'function');
  });

  it('should copy options from `a` to `app`', function() {
    var a = app.register('a', function(a) {
      a.option('foo', 'aaa');
    });

    app.compose(['a'])
      .options();

    assert.deepEqual(app.options, a.options);
  });

  it('should copy data from `a` to `app`', function() {
    var a = app.register('a', function(a) {
      a.data('foo', 'aaa');
    });

    app.compose(['a'])
      .data();

    assert.deepEqual(app.cache.data, a.cache.data);
  });

  it('should copy a task from `a` to `app`', function(cb) {
    var count = 0;
    var output = [];
    app.name = 'app';
    var a = app.register('a', function(a) {
      a.task('default', function(cb) {
        output.push(this.app.name + ': ' + this.name);
        count++;
        cb();
      });
    });

    app.compose(['a'])
      .tasks('default');

    app.build('default', function(err) {
      if (err) cb(err);
      assert.deepEqual(output, ['app: default']);
      assert.equal(count, 1);
      cb();
    });
  });

  it('should copy views from `a` to `app`', function() {
    var a = app.register('a', function(a) {
      a.create('templates');
      a.template('foo', {content: 'foo'});
    });

    app.compose(['a'])
      .views();

    assert.equal(typeof app.template, 'function');
    assert.equal(typeof app.templates, 'function');
    assert.equal(typeof app.views.templates, 'object');
    assert.equal(typeof app.views.templates.foo, 'object');
  });

  it('should copy helpers from `a` to `app`', function() {
    var a = app.register('a', function(a) {
      a.helper('foo', function(str) {
        return str + ' FOO';
      });

      a.asyncHelper('bar', function(str, next) {
        next(null, str + ' BAR');
      });
    });

    app.compose(['a'])
      .helpers();

    assert.deepEqual(app._.helpers, a._.helpers);
  });

  it('should copy engines from `a` to `app`', function() {
    var a = app.register('a', function(a) {
      a.engine('hbs', require('engine-handlebars'));
      a.engine('tmpl', require('engine-base'));
    });

    app.compose(['a'])
      .engines();

    assert.deepEqual(app._.engines, a._.engines);
  });

  it('should allow using the iterator with the currently loaded generators', function() {
    app.register('a', function(a) {});
    app.register('b', function(b) {});

    var output = [];

    app.compose(['a', 'b'])
      .iterator(function(gen) {
        output.push(gen.name);
      });

    assert.deepEqual(output, ['a', 'b']);
  });

  it('should allow using the iterator with the custom specified generators', function() {
    app.register('a', function(a) {});
    app.register('b', function(b) {});
    app.register('c', function(c) {});
    app.register('d', function(d) {});

    var output = [];

    app.compose(['a', 'b'])
      .iterator(['c', 'd'], function(gen) {
        output.push(gen.name);
      });

    assert.deepEqual(output, ['c', 'd']);
  });
});
