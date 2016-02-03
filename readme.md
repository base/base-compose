# base-compose [![NPM version](https://img.shields.io/npm/v/base-compose.svg)](https://www.npmjs.com/package/base-compose) [![Build Status](https://img.shields.io/travis/node-base/base-compose.svg)](https://travis-ci.org/node-base/base-compose)

> Compose elements from multiple applications into one.

## Install
Install with [npm](https://www.npmjs.com/):

```sh
$ npm i base-compose --save
```

## Usage

```js
var compose = require('base-compose');
app.use(compose());
```

## API

### [.compose](index.js#L39)
Setup a composition by passing in an array of generators to compose elements. If a generator cannot be found, an error will be thrown.


**Params**

* `generators` **{Array}**: Array of generators to be composed.    
* `returns` **{Object}**: Instance of [CompositionHandler](#composition-handler-api)  


**Example**



```js
var composition = app.compose(['a', 'b', 'c']);

// most of the time, use chaining
app.compose(['a', 'b', 'c'])
  .data()
  .options()
  .views();
```



### Composition Handler API

### [.data](lib/composition-handler.js#L40)
Merge the `cache.data` object from each generator onto the `app.cache.data` object.


* `returns` **{Object}**: Returns `this` for chaining  


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


### [.engines](lib/composition-handler.js#L65)
Merge the engines from each generator into the `app` engines.


* `returns` **{Object}**: Returns `this` for chaining  


**Example**



```js
app.compose(['a', 'b', 'c'])
  .engines();
```


### [.helpers](lib/composition-handler.js#L85)
Merge the helpers from each generator into the `app` helpers.


* `returns` **{Object}**: Returns `this` for chaining  


**Example**



```js
app.compose(['a', 'b', 'c'])
  .helpers();
```


### [.options](lib/composition-handler.js#L112)
Merge the options from each generator into the `app` options.


* `returns` **{Object}**: Returns `this` for chaining  


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


### [.tasks](lib/composition-handler.js#L138)
Copy the specified tasks from each generator into the `app` tasks. Task dependencies will also be copied.


* `returns` **{Object}**: Returns `this` for chaining  


**Example**



```js
app.compose(['a', 'b', 'c'])
  .tasks(['foo', 'bar', 'default']);
```


### [.views](lib/composition-handler.js#L160)
Copy the view collections and loaded views from each generator to the `app`.


* `returns` **{Object}**: Returns `this` for chaining  


**Example**



```js
app.compose(['a', 'b', 'c'])
  .views();
```


### [.iterator](lib/composition-handler.js#L200)
Iterates over the specified generators and only calls `fn` on existing generators. Function passed into the iterator will be invoked with the current generator being iterated over (`gen`) and the app passed into the original function. No binding is done within the iterator so the function passed in can be safely bound.


**Params**

* `generators` **{Array}**: Optional array of generator names to be looked up and iterated over.    
* `fn` **{Function}**: Function invoked with generator currently being iterated over and the app.    
* `returns` **{Object}**: Returns `this` for chaining  


**Example**



```js
app.compose(['a', 'b', 'c'])
  .iterator(function(gen, app) {
    // do work
    app.data(gen.cache.data);
  });

// optionally, a different array of generator names may be passed as the first argument.
app.compose(['a', 'b', 'c'])
  .iterator(['d', 'e', 'f'], function(gen, app) {
    // do work
  });
```



## Related projects
* [assemble](https://www.npmjs.com/package/assemble): Assemble is a powerful, extendable and easy to use static site generator for node.js. Used… [more](https://www.npmjs.com/package/assemble) | [homepage](https://github.com/assemble/assemble)
* [assemble-core](https://www.npmjs.com/package/assemble-core): The core assemble application with no presets or defaults. All configuration is left to the… [more](https://www.npmjs.com/package/assemble-core) | [homepage](https://github.com/assemble/assemble-core)
* [base](https://www.npmjs.com/package/base): base is the foundation for creating modular, unit testable and highly pluggable node.js applications, starting… [more](https://www.npmjs.com/package/base) | [homepage](https://github.com/node-base/base)
* [base-generators](https://www.npmjs.com/package/base-generators): Adds project-generator support to your `base` application. | [homepage](https://github.com/jonschlinkert/base-generators)
* [base-options](https://www.npmjs.com/package/base-options): Adds a few options methods to base-methods, like `option`, `enable` and `disable`. See the readme… [more](https://www.npmjs.com/package/base-options) | [homepage](https://github.com/jonschlinkert/base-options)
* [base-tasks](https://www.npmjs.com/package/base-tasks): base-methods plugin that provides a very thin wrapper around <https://github.com/jonschlinkert/composer> for adding task methods to… [more](https://www.npmjs.com/package/base-tasks) | [homepage](https://github.com/jonschlinkert/base-tasks)
* [generate](https://www.npmjs.com/package/generate): Fast, composable, highly extendable project generator with a user-friendly and expressive API. | [homepage](https://github.com/generate/generate)
* [update](https://www.npmjs.com/package/update): Easily keep anything in your project up-to-date by installing the updaters you want to use… [more](https://www.npmjs.com/package/update) | [homepage](https://github.com/update/update)
* [verb](https://www.npmjs.com/package/verb): Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used… [more](https://www.npmjs.com/package/verb) | [homepage](https://github.com/verbose/verb)

## Running tests
Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/doowb/base-compose/issues/new).

## Author
**Brian Woodward**

+ [github/doowb](https://github.com/doowb)
+ [twitter/doowb](http://twitter.com/doowb)

## License
Copyright © 2016 [Brian Woodward](https://github.com/doowb)
Released under the MIT license.

***

_This file was generated by [verb](https://github.com/verbose/verb) on February 03, 2016._
