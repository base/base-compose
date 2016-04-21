# base-compose [![NPM version](https://img.shields.io/npm/v/base-compose.svg?style=flat)](https://www.npmjs.com/package/base-compose) [![NPM downloads](https://img.shields.io/npm/dm/base-compose.svg?style=flat)](https://npmjs.org/package/base-compose) [![Build Status](https://img.shields.io/travis/node-base/base-compose.svg?style=flat)](https://travis-ci.org/node-base/base-compose)

> Selectively merge values from one or more generators onto the current application instance.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install base-compose --save
```

This plugin requires the [base-generators](https://github.com/node-base/base-generators) to be registered first. If not already registered, you can do so now by following [these instructions](#base-generators).

## Usage

```js
var compose = require('base-compose');
var Base = require('base');
var app = new Base();

// register the "compose" plugin
app.use(compose());
```

## API

**Heads up!**

Some of the methods exposed on [.compose](#methods) expect for `app` to be an instance of [templates](https://github.com/jonschlinkert/templates), or for specific plugins to be registered first.

You don't need to register all of the plugins prescribed below, just use the plugins you need with the methods you need. `base-compose` will give you detailed error messages when something is missing.

More information is provided in the [methods documentation](#methods) below.

### [.compose](index.js#L38)

Setup a composition by passing in an array of generators to compose elements. If a generator cannot be found, an error will be thrown.

**Params**

* `names` **{String|Array}**: One or more generator names.
* `returns` **{Object}**: Returns an instance of `Compose`

**Example**

```js
app.compose(['a', 'b', 'c'])
  .data()
  .options()
  .helpers()
  .views();
```

### [.compose.options](lib/compose.js#L42)

Merge the options from each generator into the `app` options. This method requires using the [base-option][base-option] plugin.

**Params**

* `key` **{String}**: Optionally pass the name of a property to merge from the `options` object. Dot-notation may be used for nested properties.
* `returns` **{Object}**: Returns the `Compose` instance for chaining

**Example**

```js
a.option({foo: 'a'});
b.option({foo: 'b'});
c.option({foo: 'c'});

app.compose(['a', 'b', 'c'])
  .options();

console.log(app.options);
//=> {foo: 'c'}
```

### [.compose.data](lib/compose.js#L74)

Merge the `cache.data` object from each generator onto the `app.cache.data` object. This method requires the `.data()` method from [templates](https://github.com/jonschlinkert/templates).

**Params**

* `key` **{String}**: Optionally pass a key to merge from the `data` object.
* `returns` **{Object}**: Returns the `Compose` instance for chaining

**Example**

```js
a.data({foo: 'a'});
b.data({foo: 'b'});
c.data({foo: 'c'});

app.compose(['a', 'b', 'c'])
  .data();

console.log(app.cache.data);
//=> {foo: 'c'}
```

### [.compose.engines](lib/compose.js#L103)

Merge the engines from each generator into the `app` engines. This method requires the `.engine()` methods from [templates](https://github.com/jonschlinkert/templates).

* `returns` **{Object}**: Returns the `Compose` instance for chaining

**Example**

```js
app.compose(['a', 'b', 'c'])
  .engines();
```

### [.compose.helpers](lib/compose.js#L128)

Merge the helpers from each generator into `app.helpers`. Requires the `.helper` method from [templates](https://github.com/jonschlinkert/templates).

* `returns` **{Object}**: Returns the `Compose` instance for chaining

**Example**

```js
app.compose(['a', 'b', 'c'])
  .helpers();
```

### [.compose.pipeline](lib/compose.js#L154)

Merge the pipeline plugins from each generator onto `app.plugins`. Requires the [base-pipeline](https://github.com/node-base/base-pipeline) plugin to be registered.

* `returns` **{Object}**: Returns the `Compose` instance for chaining

**Example**

```js
app.compose(['a', 'b', 'c'])
  .pipeline();
```

### [.compose.tasks](lib/compose.js#L188)

Copy the specified tasks and task-dependencies from each generator onto `app.tasks`. Requires using the [base-task](https://github.com/node-base/base-task) plugin to be registered.

**Params**

* `tasks` **{String|Array}**: One or more task names (optional)
* `returns` **{Object}**: Returns the `Compose` instance for chaining

**Example**

```js
app.compose(['a', 'b', 'c'])
  .tasks(['foo', 'bar', 'default']);

// or to copy all tasks
app.compose(['a', 'b', 'c'])
  .tasks();
```

### [.compose.views](lib/compose.js#L217)

Copy view collections and views from each generator onto `app`. Expects `app` to be an instance of [templates](https://github.com/jonschlinkert/templates).

**Params**

* `names` **{Array|String}**: (optional) Names of one or more collections to copy. If undefined all collections will be copied.
* `filter` **{Function}**: Optionally pass a filter function to filter views copied from each collection. The filter function exposes `key`, `view` and `collection` as arguments. If used, the function must return `true` to copy a view.
* `returns` **{Object}**: Returns the `Compose` instance for chaining

**Example**

```js
app.compose(['a', 'b', 'c'])
  .views();
```

### [.compose.iterator](lib/compose.js#L296)

Returns an iterator function for iterating over an array of generators. The iterator takes a `fn` that exposes the current generator being iterated over (`generator`) and the app passed into the original function as arguments. No binding is done within the iterator so the function passed in can be safely bound.

**Params**

* `names` **{Array}**: Names of generators to iterate over (optional).
* `iteratorFn` **{Function}**: Function to invoke for each generator in `generators`. Exposes `app` and `generator` as arguments.
* `returns` **{Object}**: Returns the `Compose` instance for chaining

**Example**

```js
app.compose(['a', 'b', 'c'])
  .iterator(function(generator, app) {
    // do work
    app.data(generator.cache.data);
  });

// optionally pass an array of additional generator names as the
// first argument. If generator names are defined on `iterator`,
// any names passed to `.compose()` will be ignored.
app.compose(['a', 'b', 'c'])
  .iterator(['d', 'e', 'f'], function(generator, app) {
    // do stuff to `generator` and `app`
  });
```

## base-generators

Follow these instructions to install and register the [base-generators](https://github.com/node-base/base-generators) plugin before registering `base-compose`.

**Install base-generators**

```sh
$ npm install base-generators --save
```

**Register base-generators**

```js
var generators = require('base-generators');
var compose = require('base-compose');
var Base = require('base');
var app = new Base();

// register plugins
app.use(generators());
app.use(compose());
```

## Related projects

You might also be interested in these projects:

* [assemble](https://www.npmjs.com/package/assemble): Assemble is a powerful, extendable and easy to use static site generator for node.js. Used… [more](https://www.npmjs.com/package/assemble) | [homepage](https://github.com/assemble/assemble)
* [base](https://www.npmjs.com/package/base): base is the foundation for creating modular, unit testable and highly pluggable node.js applications, starting… [more](https://www.npmjs.com/package/base) | [homepage](https://github.com/node-base/base)
* [generate](https://www.npmjs.com/package/generate): Fast, composable, highly extendable project generator with a user-friendly and expressive API. | [homepage](https://github.com/generate/generate)
* [verb](https://www.npmjs.com/package/verb): Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used… [more](https://www.npmjs.com/package/verb) | [homepage](https://github.com/verbose/verb)

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/doowb/base-compose/issues/new).

## Building docs

Generate readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install verb && npm run docs
```

Or, if [verb](https://github.com/verbose/verb) is installed globally:

```sh
$ verb
```

## Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

## Author

**Brian Woodward**

* [github/doowb](https://github.com/doowb)
* [twitter/doowb](http://twitter.com/doowb)

## License

Copyright © 2016, [Brian Woodward](https://github.com/doowb).
Released under the [MIT license](https://github.com/node-base/base-compose/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on April 20, 2016._