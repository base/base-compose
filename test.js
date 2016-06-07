'use strict';

require('mocha');
var assert = require('assert');
var Base = require('base').namespace('test');
var assemble = require('assemble-core');
var pipeline = require('base-pipeline');
var generators = require('base-generators');
var questions = require('base-questions');
var compose = require('./');
var app;
var base;

describe('base-compose', function() {
  beforeEach(function() {
    base = assemble();
    base.use(generators());
    base.use(compose());

    app = assemble();
    app.use(generators());
    app.use(compose());
  });

  it('should add `.compose` method to `app`', function() {
    assert.equal(typeof app.compose, 'function');
  });

  it('should not have any generators if none are passed', function() {
    assert.deepEqual(app.compose(base).generators, []);
  });

  it('should throw an error when "base-generators" is not registered', function(cb) {
    try {
      app = new Base();
      app.isApp = true;
      app.use(compose());
      app.compose();
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'expected the base-generators plugin to be registered');
      cb();
    }
  });

  it('should throw an error when "parent" is not passed in', function(cb) {
    try {
      app.compose();
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'expected the base-generators plugin to be registerd on "parent"');
      cb();
    }
  });

  describe('options', function() {
    it('should copy options from `a` to `app`', function() {
      var a = base.register('a', function(a) {
        a.option('foo', 'aaa');
      });

      app.compose(base, ['a'])
        .options();

      assert.deepEqual(app.options, a.options);
    });

    it('should copy options from `a` to `app` specified by property path', function() {
      base.register('a', function(a) {
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

      app.compose(base, ['a'])
        .options('a.b.c');

      assert.deepEqual(app.options, {a: {b: {c: {d: 'e'}}}});
    });
  });

  describe('data', function() {
    it('should copy data from `a` to `app`', function() {
      var a = base.register('a', function(a) {
        a.data('foo', 'aaa');
      });

      app.compose(base, ['a'])
        .data();

      assert.deepEqual(app.cache.data, a.cache.data);
    });

    it('should copy data from `a` to `app` specified by property path', function() {
      base.register('a', function(a) {
        a.data({
          a: {b: {c: {d: 'e'}, c1: {d: 'e'}}, b1: {c1: {d: 'e'}}},
          a1: {b: {c: {d: 'e'}}}
        });
      });

      app.compose(base, ['a'])
        .data('a.b.c');

      assert.deepEqual(app.cache.data, {a: {b: {c: {d: 'e'}}}});
    });

    it('should throw an error when the `data` api is not present', function(cb) {
      app = new Base();
      app.isApp = true;
      app.use(generators());
      app.use(compose());
      base.register('a', function() {});
      try {
        app.compose(base, ['a']).data();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'expected the base-data plugin to be registered');
        cb();
      }
    });
  });

  describe('engines', function() {
    it('should copy engines from `a` to `app`', function() {
      var a = base.register('a', function(a) {
        a.engine('hbs', require('engine-handlebars'));
        a.engine('tmpl', require('engine-base'));
      });

      app.compose(base, ['a'])
        .engines();

      assert.deepEqual(app._.engines, a._.engines);
    });

    it('should throw an error when the `engine` api is not present', function(cb) {
      app = new Base();
      app.isApp = true;
      app.use(generators());
      app.use(compose());
      base.register('a', function() {});
      try {
        app.compose(base, ['a']).engines();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, '.engines requires an instance of templates');
        cb();
      }
    });
  });

  describe('helpers', function() {
    it('should copy helpers from `a` to `app`', function() {
      var a = base.register('a', function(a) {
        a.helper('foo', function(str) {
          return str + ' FOO';
        });

        a.asyncHelper('bar', function(str, next) {
          next(null, str + ' BAR');
        });
      });

      app.compose(base, ['a'])
        .helpers();

      assert.deepEqual(app._.helpers, a._.helpers);
    });

    it('should throw an error when the `helper` api is not present', function(cb) {
      app = new Base();
      app.isApp = true;
      app.use(generators());
      app.use(compose());
      base.register('a', function() {});
      try {
        app.compose(base, ['a']).helpers();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, '.helpers requires an instance of templates');
        cb();
      }
    });
  });

  describe('questions', function() {
    it('should copy questions from a generator to `app`', function() {
      base.use(questions());
      app.use(questions());

      base.register('foo', function(foo) {
        foo.question('first.name', 'What is your first name?');
        foo.question('last.name', 'What is your last name?');
      });

      app.compose(base, ['foo'])
        .questions();

      assert(app.questions.cache.hasOwnProperty('first.name'));
      assert(app.questions.cache.hasOwnProperty('last.name'));
    });

    it('should copy questions from multiple generators to `app`', function() {
      base.use(questions());
      app.use(questions());

      base.register('foo', function(foo) {
        foo.question('first.name', 'What is your first name?');
        foo.question('last.name', 'What is your last name?');
      });

      base.register('bar', function(bar) {
        bar.question('project.name', 'What is the project name?');
      });

      app.compose(base, ['foo', 'bar'])
        .questions();

      assert(app.questions.cache.hasOwnProperty('first.name'));
      assert(app.questions.cache.hasOwnProperty('last.name'));
      assert(app.questions.cache.hasOwnProperty('project.name'));
    });

    it('should not copy questions from unspecified generators', function() {
      base.use(questions());
      app.use(questions());

      base.register('foo', function(foo) {
        foo.question('first.name', 'What is your first name?');
        foo.question('last.name', 'What is your last name?');
      });

      base.register('bar', function(bar) {
        bar.question('project.name', 'What is the project name?');
      });

      app.compose(base, ['foo'])
        .questions();

      assert(app.questions.cache.hasOwnProperty('first.name'));
      assert(app.questions.cache.hasOwnProperty('last.name'));
      assert(!app.questions.cache.hasOwnProperty('project.name'));
    });

    it('should throw an error when the `base-questions` plugin is not registered', function(cb) {
      app = new Base();
      app.isApp = true;
      app.use(generators());
      app.use(compose());
      base.register('foo', function() {});
      try {
        app.compose(base, 'foo').questions();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'expected the base-questions plugin to be registered');
        cb();
      }
    });
  });

  describe('pipeline plugins', function() {
    beforeEach(function() {
      base = assemble();
      base.use(pipeline());
      base.use(generators());
      base.use(compose());

      app = assemble();
      app.use(pipeline());
      app.use(generators());
      app.use(compose());
    });

    it('should copy plugins from generator `abc` to `app`', function() {
      base.register('abc', function(gen) {
        gen.plugin('foo', function() {});
        gen.plugin('bar', function() {});
      });

      app.compose(base, ['abc'])
        .pipeline();

      assert.deepEqual(app.plugins, base.getGenerator('abc').plugins);
    });

    it('should throw an error when the `helper` api is not present', function(cb) {
      app = new Base();
      app.isApp = true;
      app.use(generators());
      app.use(compose());
      base.register('a', function() {});
      try {
        app.compose(base, ['a']).pipeline();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'expected the base-pipeline plugin to be registered');
        cb();
      }
    });
  });

  describe('tasks', function() {
    it('should copy a task from `a` to `app`', function(cb) {
      var count = 0;
      var output = [];
      app.name = 'app';
      base.register('a', function(a) {
        a.task('default', function(cb) {
          output.push(this.app.name + ': ' + this.name);
          count++;
          cb();
        });
      });

      app.compose(base, ['a'])
        .tasks('default');

      app.build('default', function(err) {
        if (err) cb(err);
        assert.deepEqual(output, ['app: default']);
        assert.equal(count, 1);
        cb();
      });
    });

    it('should copy all tasks from `a` to `app`', function(cb) {
      var count = 0;
      var output = [];
      app.name = 'app';
      base.register('a', function(a) {
        a.task('default', function(cb) {
          output.push(this.app.name + ': ' + this.name);
          count++;
          cb();
        });

        a.task('foo', function(cb) {
          output.push(this.app.name + ': ' + this.name);
          count++;
          cb();
        });
      });

      app.compose(base, ['a'])
        .tasks();

      app.build(['default', 'foo'], function(err) {
        if (err) cb(err);
        assert.deepEqual(output, ['app: default', 'app: foo']);
        assert.equal(count, 2);
        cb();
      });
    });

    it('should copy a task and dependencies from `a` to `app`', function(cb) {
      var count = 0;
      var output = [];
      app.name = 'app';
      base.register('a', function(a) {
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

      app.compose(base, ['a'])
        .tasks('default');

      app.build('default', function(err) {
        if (err) cb(err);
        assert.deepEqual(output, ['app: foo', 'app: default']);
        assert.equal(count, 2);
        cb();
      });
    });

    it('should throw an error when a task does not exist on `a`.', function(cb) {
      base.register('a', function(a) {
        a.task('foo', function(cb) {
          cb();
        });

        a.task('default', function(cb) {
          cb();
        });
      });

      try {
        app.compose(base, ['a'])
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
      app.isApp = true;
      app.use(generators());
      app.use(compose());
      delete app.task;

      base.register('a', function() {});
      try {
        app.compose(base, ['a']).tasks();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'expected the base-task plugin to be registered');
        cb();
      }
    });
  });

  describe('views', function() {
    it('should copy views from `a` to `app`', function() {
      base.register('a', function(a) {
        a.create('templates');
        a.template('foo', {content: 'foo'});
      });

      app.compose(base, ['a'])
        .views();

      assert.equal(typeof app.template, 'function');
      assert.equal(typeof app.templates, 'function');
      assert.equal(typeof app.views.templates, 'object');
      assert.equal(typeof app.views.templates.foo, 'object');
    });

    it('should only copy collections from `a` to `app` that are not already on `app`', function() {
      app.create('templates');
      app.template('bar', {content: 'bar'});
      base.register('a', function(a) {
        a.create('templates');
        a.template('foo', {content: 'foo'});
      });

      app.compose(base, ['a'])
        .views();

      assert.equal(typeof app.template, 'function');
      assert.equal(typeof app.templates, 'function');
      assert.equal(typeof app.views.templates, 'object');
      assert.equal(typeof app.views.templates.foo, 'object');
      assert.equal(typeof app.views.templates.bar, 'object');
    });

    it('should only copy specified collections from `a` to `app`', function() {
      base.register('a', function(a) {
        a.create('templates');
        a.template('foo.hbs', {content: 'foo'});

        a.create('files');
        a.file('foo.md', {content: 'foo'});
      });

      app.compose(base, ['a'])
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
      base.register('a', function(a) {
        a.create('templates');
        a.template('foo.hbs', {content: 'foo'});

        a.create('files');
        a.file('foo.md', {content: 'foo'});
        a.file('bar.md', {content: 'bar'});
      });

      app.compose(base, ['a'])
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
      base.register('a', function(a) {
        a.create('templates');
        a.template('foo.hbs', {content: 'foo'});
        a.template('bar.hbs', {content: 'bar'});

        a.create('files');
        a.file('foo.md', {content: 'foo'});
        a.file('bar.md', {content: 'bar'});
      });

      app.compose(base, ['a'])
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
      app.isApp = true;
      app.use(generators());
      app.use(compose());
      base.register('a', function() {});
      try {
        app.compose(base, ['a']).views();
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, '.views requires an instance of templates');
        cb();
      }
    });
  });

  describe('iterator', function() {
    it('should allow using the iterator with the currently loaded generators', function() {
      base.register('a', function(a) {});
      base.register('b', function(b) {});

      var output = [];

      app.compose(base, ['a', 'b'])
        .iterator(function(gen) {
          output.push(gen.name);
        });

      assert.deepEqual(output, ['a', 'b']);
    });

    it('should allow using the iterator with the custom specified generators', function() {
      base.register('a', function(a) {});
      base.register('b', function(b) {});
      base.register('c', function(c) {});
      base.register('d', function(d) {});

      var output = [];

      app.compose(base, ['a', 'b'])
        .iterator(['c', 'd'], function(gen) {
          output.push(gen.name);
        });

      assert.deepEqual(output, ['c', 'd']);
    });

    it('should allow using the iterator with generator instances', function() {
      base.register('a', function(a) {});
      base.register('b', function(b) {});
      base.register('c', function(c) {});
      base.register('d', function(d) {});

      var output = [];

      app.compose(base, ['a', base.getGenerator('b')])
        .iterator(function(gen) {
          output.push(gen.name);
        });

      assert.deepEqual(output, ['a', 'b']);
    });

    it('should allow using the iterator with custom generator instances', function() {
      base.register('a', function(a) {});
      base.register('b', function(b) {});
      base.register('c', function(c) {});
      base.register('d', function(d) {});

      var output = [];

      app.compose(base, ['a', base.getGenerator('b')])
        .iterator(['c', base.getGenerator('d')], function(gen) {
          output.push(gen.name);
        });

      assert.deepEqual(output, ['c', 'd']);
    });

    it('should throw an error when a generator is not found', function(cb) {
      var count = 0;
      try {
        app.compose(base, 'a')
          .iterator(function(gen, app) {
            count++;
          });
        cb(new Error('expected an error'));
      } catch (err) {
        assert(err);
        assert.equal(err.message, 'generator "a" is not registered');
        assert.equal(count, 0);
        cb(null);
      }
    });

    it('should emit an error when a generator is not found', function(cb) {
      var count = 0;
      app.on('error', function(err) {
        assert.equal(count, 0);
        assert(err);
        assert.equal(err.message, 'generator "a" is not registered');
        cb(null);
      });

      app.compose(base, 'a')
        .iterator(function(gen, app) {
          count++;
        });
    });
  });
});
