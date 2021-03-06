# reversable-router

***
The project is deprecated. Please see [named-routes](https://github.com/alubbe/named-routes) for an actively maintained and express 4 compatible fork.
***


`node.js` module for routing HTTP requests. Can be used standalone or as part of [express.js](http://expressjs.com/) framework.

**Feature overview**:
 - Support for named routes
 - URLs can be generated by providing a `name` of the route and the required `parameters`
 - Support for optional parts in the route `path` (and URL generation still works with as many optional parts as you want)
 - Support for anonymous `*` parameters inside the path
 - Supports converting the last anonymous parameter to pairs of `param`=>`value` separated by `/`
 - Improved performance on literal matches
 - Supports callbacks for router parameters. Same logic as `express` native router.
 - Supports middleware route callbacks. Same logic as `express` native router.
 - Supports array of middleware route callbacks. Same logic as `express` native router.
 - Can be used standalone or as replacement for express.js routing.

## Install

```
npm install reversable-router
```

## Features

### Example
#### As a replacement for express framework router
```js
var express = require('express');
var app = express();

var Router = require('reversable-router');
var router = new Router();
router.extendExpress(app);
router.registerAppHelpers(app);

app.get('/admin/user/:id', 'admin.user.edit', function(req, res, next){
    var url = app._router.build('admin.user.edit', {id: 2}); // /admin/user/2
});

//.. and a helper in the view files:
url('admin.user.edit', {id: 2})

```
Alternatively to route a group of requests to the same URL but using a different HTTP method:
```js
app.route('/admin/user/:id', 'admin.user.edit', function(){
    app.get(function(req, res, next) {
	    // show..
    })
    app.post(function(req, res, next) {
	    // insert..
    })
});
// or even:
app.route('/admin/user/:id', 'admin.user.edit', {
	get: function(req, res, next) {
	    // show..
	},
	post: function(req, res, next) {
	    // insert..
	}
});
```

#### As a standalone

```js
var Router = require('reversable-router')();
var router = new Router();

router.add('get', '/admin/user/:id', function() {
	var url = router.build('admin.user.edit', {id: 2}); // /admin/user/2
}, {
    name: 'admin.user.edit'
});

//...
router.dispatch(req);
```

### Benefits of named routes
You can easily check the current route in middleware without stating the defined route path. Thus avoding duplication and keeping route paths in a central place.

This allows the path to the route to be changed as frequently while the rest of the logic across middleware or views to remain the same.

### Generating URLs
Both example above incude a URL generation.

If you're using express:
```js
// in the views:
url('admin.user.edit', {id: 2})
// anywhere else:
app._router.build('admin.user.edit', {id: 2})
```
If not:
```js
router.build('admin.user.edit', {id: 2});
```

### Full support for optional parts of the URL
You can define routes like this:

```js
app.get('/admin/(user/(edit/:id/)(album/:albumId/):session/)test', 'admin', function(req, res, next){
    console.log(req.params);
});
```

Brackets define the limits of the optional parts. Here you have 3 optional parts. 2 of them nested in the other.

If you don't pass all the parameters inside a optional part, the part will simply be removed from the generated URL.

So in the views:
```js
url('admin', {id: 4, albumId:2, session: 'qwjdoqiwdasdj12asdiaji198a#asd'});
// will generate: /admin/user/edit/4/album/2/qwjdoqiwdasdj12asdiaji198a/test
```
```js
url('admin', {id: 4, session: 'qwjdoqiwdasdj12asdiaji198a#asd'});
// will generate: /admin/user/edit/4/qwjdoqiwdasdj12asdiaji198a/test
```
```js
url('admin', {albumId: 2, session: 'qwjdoqiwdasdj12asdiaji198a#asd'});
// will generate: /admin/user/album/2/qwjdoqiwdasdj12asdiaji198a/test
```
```js
url('admin', {id: 4, albumId:2});
// will generate: /admin/test
// because :session parameter is missing and the optional part
// that contains it contains also the other 2 parts
```

### Improved matching speed for literal matches
Significant amount of the routes in an web applications are simply hardcoded strings. Things like `/admin` or `/user/login`.
Such routes will be matched with direct check for equallity without the need for a regular expression execution.

### Anonymous `*` parameters inside the path
```js
app.get('/admin/*/user/*/:id/', 'admin.user.edit', function(req, res, next){
    console.log(req.params)
});
```
Requesting: `/admin/any/user/thing/2` will output:
```
{
  _masked: [ 'any', 'thing'],
  id: '2'
}
```

Analogous in order to generate the same url:
```js
url('admin.user.edit', {id:2, _masked: ['any','thing']})
```

### Converting the trailing `*` anonymous parameter to multiple `name:value` parameters
```js
app.get('/admin/*/user/*/:id/albums/*', 'admin.user.edit', function(req, res, next){
    console.log(req.params)
}, {
	wildcardInPairs: true
});
```
Requesting: `/admin/any/user/thing/2/albums/sort/name/order/desc` will output:
```
{
  _masked: [ 'any', 'thing'],
  id: '2',
  sort: 'name',
  order: 'desc'
}
```

Analogous in order to generate the same url:
```js
url('admin.user.edit', {id:2, _masked: ['any','thing'], sort: 'name', 'order': 'desc'})
```


## Future development planned

### Publish
 - Organise and publish tests

### Implement
 - Query based routing and generation

### Investigate
**meta-routing** Middleware depending on media? mobile, desktop, agent

## License
(The MIT License)

Copyright (c) 2012 Anton Stoychev <anton@napopa.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
