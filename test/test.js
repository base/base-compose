'use strict';

require('mocha');
var Base = require('base').namespace('test');
var assert = require('assert');
var Assemble = require('assemble-core');
var generators = require('base-generators');
Assemble.use(generators());

var compose = require('../');
var app;

describe('base-compose', function() {
  beforeEach(function() {
    app = new Assemble();
    app.use(compose());
  });

  it('should add `.compose` method to `app`', function() {
    assert.equal(typeof app.compose, 'function');
  });

  it('should not have any generators if none are passed', function() {
    assert.deepEqual(app.compose().generators, []);
  });

  it('should throw an error when an app not using "base-generators" is used', function(cb) {
    function App () {
      Base.call(this);
    }
    Base.extend(App);
    app = new App();
    app.use(compose());
    try {
      app.compose();
      cb(new Error('expected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, '.compose expects an "app" using the "base-generators" plugin');
      cb();
    }
  });

  describe('data', function() {
    it('should copy data from `a` to `app`', function() {
      var a = app.register('a', function(a) {
        a.data('foo', 'aaa');
      });

      app.compose(['a'])
        .data();

      assert.deepEqual(app.cache.data, a.cache.data);
    });

    it('should copy data from `a` to `app` specified by property path', function() {
      var a = app.register('a', function(a) {
        a.data({
          a: {
            b: {
              c: {d: 'e'},
              c1: {d: 'e'}
            },
            b1: {
              c1: {d: 'e'}
            }
          },
          a1: {b: {c: {d: 'e'}}}
        });
      });

      app.compose(['a'])
        .data('a.b.c');

      assert.deepEqual(app.cache.data, {a: {b: {c: {d: 'e'}}}});
    });

    it('should throw an error when the `data` api is not present', function(cb) {
      app = new Base();
      app.use(generators());
      app.use(compose());
      app.register('a', function() {});
      try {
        app.compose(['a']).data();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, '.data expects a ".data()" method on "app"');
        cb();
      }
    });
  });

  describe('engines', function() {
    it('should copy engines from `a` to `app`', function() {
      var a = app.register('a', function(a) {
        a.engine('hbs', require('engine-handlebars'));
        a.engine('tmpl', require('engine-base'));
      });

      app.compose(['a'])
        .engines();

      assert.deepEqual(app._.engines, a._.engines);
    });

    it('should throw an error when the `engine` api is not present', function(cb) {
      app = new Base();
      app.use(generators());
      app.use(compose());
      app.register('a', function() {});
      try {
        app.compose(['a']).engines();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, '.engines expects an ".engine()" method on "app"');
        cb();
      }
    });
  });

  describe('helpers', function() {
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

    it('should throw an error when the `helper` api is not present', function(cb) {
      app = new Base();
      app.use(generators());
      app.use(compose());
      app.register('a', function() {});
      try {
        app.compose(['a']).helpers();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, '.helpers expects a ".helper()" method on "app"');
        cb();
      }
    });
  });

  describe('options', function() {
    it('should copy options from `a` to `app`', function() {
      var a = app.register('a', function(a) {
        a.option('foo', 'aaa');
      });

      app.compose(['a'])
        .options();

      assert.deepEqual(app.options, a.options);
    });

    it('should copy options from `a` to `app` specified by property path', function() {
      var a = app.register('a', function(a) {
        a.option({
          a: {
            b: {
              c: {d: 'e'},
              c1: {d: 'e'}
            },
            b1: {
              c1: {d: 'e'}
            }
          },
          a1: {b: {c: {d: 'e'}}}
        });
      });

      app.compose(['a'])
        .options('a.b.c');

      assert.deepEqual(app.options, {a: {b: {c: {d: 'e'}}}});
    });

    it('should throw an error when the `option` api is not present', function(cb) {
      app = new Base();
      app.use(generators());
      app.use(compose());
      app.register('a', function() {});
      try {
        app.compose(['a']).options();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, '.options expects an ".option()" method from "base-option" on "app"');
        cb();
      }
    });
  });

  describe('tasks', function() {
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

    it('should copy a task and dependencies from `a` to `app`', function(cb) {
      var count = 0;
      var output = [];
      app.name = 'app';
      var a = app.register('a', function(a) {
        a.task('foo', function(cb) {
          output.push(this.app.name + ': ' + this.name);
          count++;
          cb();
        });

        a.task('default', ['foo'], function(cb) {
          output.push(this.app.name + ': ' + this.name);
          count++;
          cb();
        });
      });

      app.compose(['a'])
        .tasks('default');

      app.build('default', function(err) {
        if (err) cb(err);
        assert.deepEqual(output, ['app: foo', 'app: default']);
        assert.equal(count, 2);
        cb();
      });
    });

    it('should throw an error when a task does not exist on `a`.', function(cb) {
      var a = app.register('a', function(a) {
        a.task('foo', function(cb) {
          cb();
        });

        a.task('default', function(cb) {
          cb();
        });
      });

      try {
        app.compose(['a'])
          .tasks(['foo', 'bar']);
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, '"bar" not found in tasks');
        cb();
      }
    });

    it('should throw an error when the `task` api is not present', function(cb) {
      app = new Base();
      app.use(generators());
      app.use(compose());
      delete app.task;

      app.register('a', function() {});
      try {
        app.compose(['a']).tasks();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, '.tasks expects a ".task()" method from "base-task" on "app"');
        cb();
      }
    });
  });

  describe('views', function() {
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

    it('should only copy collections from `a` to `app` that are not already on `app`', function() {
      app.create('templates');
      app.template('bar', {content: 'bar'});
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
      assert.equal(typeof app.views.templates.bar, 'object');
    });

    it('should only copy specified collections from `a` to `app`', function() {
      var a = app.register('a', function(a) {
        a.create('templates');
        a.template('foo.hbs', {content: 'foo'});

        a.create('files');
        a.file('foo.md', {content: 'foo'});
      });

      app.compose(['a'])
        .views(['files']);

      assert.equal(typeof app.template, 'undefined');
      assert.equal(typeof app.templates, 'undefined');
      assert.equal(typeof app.file, 'function');
      assert.equal(typeof app.files, 'function');
      assert.equal(typeof app.views.templates, 'undefined');
      assert.equal(typeof app.views.files, 'object');
      assert.equal(typeof app.views.files['foo.md'], 'object');
    });

    it('should only copy filtered views from specified collections from `a` to `app`', function() {
      var a = app.register('a', function(a) {
        a.create('templates');
        a.template('foo.hbs', {content: 'foo'});

        a.create('files');
        a.file('foo.md', {content: 'foo'});
        a.file('bar.md', {content: 'bar'});
      });

      app.compose(['a'])
        .views(['files'], function(key, view) {
          return key.indexOf('foo') !== -1;
        });

      assert.equal(typeof app.template, 'undefined');
      assert.equal(typeof app.templates, 'undefined');
      assert.equal(typeof app.file, 'function');
      assert.equal(typeof app.files, 'function');
      assert.equal(typeof app.views.templates, 'undefined');
      assert.equal(typeof app.views.files, 'object');
      assert.equal(typeof app.views.files['foo.md'], 'object');
      assert.equal(typeof app.views.files['bar.md'], 'undefined');
    });

    it('should only copy filtered views from all collections from `a` to `app`', function() {
      var a = app.register('a', function(a) {
        a.create('templates');
        a.template('foo.hbs', {content: 'foo'});
        a.template('bar.hbs', {content: 'bar'});

        a.create('files');
        a.file('foo.md', {content: 'foo'});
        a.file('bar.md', {content: 'bar'});
      });

      app.compose(['a'])
        .views(function(key, view) {
          return key.indexOf('foo') !== -1;
        });

      assert.equal(typeof app.template, 'function');
      assert.equal(typeof app.templates, 'function');
      assert.equal(typeof app.file, 'function');
      assert.equal(typeof app.files, 'function');
      assert.equal(typeof app.views.templates, 'object');
      assert.equal(typeof app.views.templates['foo.hbs'], 'object');
      assert.equal(typeof app.views.templates['bar.hbs'], 'undefined');
      assert.equal(typeof app.views.files, 'object');
      assert.equal(typeof app.views.files['foo.md'], 'object');
      assert.equal(typeof app.views.files['bar.md'], 'undefined');
    });

    it('should throw an error when the `views` api is not present', function(cb) {
      app = new Base();
      app.use(generators());
      app.use(compose());
      app.register('a', function() {});
      try {
        app.compose(['a']).views();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, '.views expects the "app" to be inherited from "templates"');
        cb();
      }
    });
  });

  describe('iterator', function() {
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

    it('should throw an error when a generator is not found', function(cb) {
      var count = 0;
      try {
        app.compose('a')
          .iterator(function(gen, app) {
            count++;
          });
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'Invalid generator "a"');
        assert.equal(count, 0);
        cb(null);
      }
    });
  });
});
