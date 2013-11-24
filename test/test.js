var
  expect = require('expect.js'),
  sinon = require('sinon'),
  express = require('express'),
  Router = require('../router.js');

module.exports = {
  'Reversable-router': {
    'beforeEach': function(){
      this.router = new Router();
    },
    'Express.js': {
      'beforeEach': function(){
        this.app = new express();
      },
      'extend': function(){
        this.router.extendExpress(this.app);
        this.router.registerAppHelpers(this.app);

        expect(this.app._router).to.be(this.router);
        expect(this.app._routingContext).to.be.ok();
        expect(this.app.get).to.be.a('function');
        expect(this.app['delete']).to.be.a('function');
        expect(this.app.post).to.be.a('function');
        expect(this.app.put).to.be.a('function');
        expect(this.app.route).to.be.a('function');
        expect(this.app.locals.url).to.be.a('function');
      },
      'afterEach': function(){
        this.app = null;
      }
    },
    'Standalone': {
      'matches': function(){
        var
          self = this,
          dispatchSpy = sinon.spy(),
          routeSpy = sinon.spy(),
          req = {
            method: 'get',
            path: '/admin/user/1',
            params: {}
          };

        self.router.add('get', '/admin/user/:id', routeSpy, {
            name: 'admin.user.edit'
        });

        self.router.dispatch(req, {}, function(){ });

        expect(routeSpy.calledOnce).to.equal(true);
        expect(routeSpy.calledWith(req, sinon.match.any, sinon.match.any)).to.equal(true);

        req.method = 'post';

        self.router.dispatch(req, {}, dispatchSpy);

        expect(routeSpy.callCount).to.equal(1);
        expect(dispatchSpy.called).to.equal(true);
      },
      'optionals': function(){
        var
          self = this,
          spy = sinon.spy(),
          req = {
            method: 'post',
            path: ''
          };

        self.router.add('post', '/admin/(user/(edit/:id/)(album/:albumId/):session/)test', spy);

        req.path = '/admin/user/edit/4/album/2/qwjdoqiwdasdj12asdiaji198a/test';
        req.params = {};
        self.router.dispatch(req, {}, function deadend(){ });

        req.path = '/admin/user/edit/4/qwjdoqiwdasdj12asdiaji198a/test';
        req.params = {};
        self.router.dispatch(req, {}, function deadend(){ });

        req.path = '/admin/user/album/2/qwjdoqiwdasdj12asdiaji198a/test';
        req.params = {};
        self.router.dispatch(req, {}, function deadend(){ });

        req.path = '/admin/test';
        req.params = {};
        self.router.dispatch(req, {}, function deadend(){ });

        expect(spy.callCount).to.equal(4);
      },
      'reversing': function(){
        var
          self = this,
          spy = sinon.spy();

        expect(this.router.build).to.throwError();
        expect(function(){
          this.router.build('invalid route Name');
        }).to.throwError();

        self.router.add('post', '(/:controller(/:action(/:id)))', spy, {
          'name': 'reversed'
        });

        expect(self.router.build('reversed', {
          'controller': 'Home',
          'action': 'Index'
        })).to.equal('/Home/Index');

        self.router.dispatch({
          method: 'post',
          path: '/Home/Index/'
        });

        expect(spy.called).to.equal(true);

        self.router.add('get', '/admin/(user/(edit/:id/)(album/:albumId/):session/)test', spy, {
          name: 'optionals'
        });

        expect(self.router.build('optionals', {
          id: 4,
          albumId:2,
          session: 'qwjdoqiwdasdj12asdiaji198a#asd'
        })).to.equal('/admin/user/edit/4/album/2/qwjdoqiwdasdj12asdiaji198a/test');

        expect(self.router.build('optionals', {
          id: 4,
          session: 'qwjdoqiwdasdj12asdiaji198a#asd'
        })).to.equal('/admin/user/edit/4/qwjdoqiwdasdj12asdiaji198a/test');

        expect(self.router.build('optionals', {
          albumId: 2,
          session: 'qwjdoqiwdasdj12asdiaji198a#asd'
        })).to.equal('/admin/user/album/2/qwjdoqiwdasdj12asdiaji198a/test');

        expect(self.router.build('optionals', {
          id: 4, albumId:2
        })).to.equal('/admin/test');
      },
      'masked': function(){
        var
          self = this,
          req = {
            method: 'get',
            path: ''
          },
          next = sinon.spy(),
          spy = sinon.spy();

        self.router.add('get', '/admin/*/user/*/:id', spy, {
          name: 'admin.user.edit'
        });

        req.path = '/admin/any/user/thing/2';
        req.params = {};

        self.router.dispatch(req, {}, next); // the next route shouldn't be called

        expect(spy.called).to.equal(true);
        expect(next.called).to.equal(false);

        expect(self.router.build('admin.user.edit', {
          id:2, _masked: ['any','thing']
        })).to.equal('/admin/any/user/thing/2');

        self.router.add('get', '/admin/*/user/*/:id/albums/*', spy, {
          wildcardInPairs: true,
          name: 'admin.user.edit2'
        });

        req.path = '/admin/any/user/thing/2/albums/sort/name/order/desc';
        req.params = {};

        spy.reset();
        next.reset();

        self.router.dispatch(req, {}, next); // the next route shouldn't be called

        expect(next.called).to.equal(false);
        expect(req.params).to.eql({
          _masked: [ 'any', 'thing'],
          id: '2',
          sort: 'name',
          order: 'desc'
        });

        expect(self.router.build('admin.user.edit2', {
          id:2,
          _masked: ['any','thing'],
          sort: 'name',
          'order': 'desc'
        })).to.equal('/admin/any/user/thing/2/albums/sort/name/order/desc');

        expect(spy.callCount).to.equal(1);
      },
    },
    'afterEach': function(){
      this.router = null;
    }
  }
};