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
        expect(this.app.locals.url).to.be(this.router.build);
      },
      'afterEach': function(){
        this.app = null;
      }
    },
    'Standalone': {
      'matches': function(){
        var
          self = this,
          spies = [sinon.spy(),sinon.spy()],
          req = {
            method: 'get',
            path: '/admin/user/1',
            params: {}
          };

        self.router.add('get', '/admin/user/:id', spies[0], {
            name: 'admin.user.edit'
        });

        self.router.dispatch(req);

        expect(spies[0].calledOnce).to.equal(true);
        expect(spies[0].calledWith(req, sinon.match.any, sinon.match.any)).to.equal(true);

        req.method = 'post';

        self.router.dispatch(req, {}, spies[1]);

        expect(spies[0].callCount).to.equal(1);
        expect(spies[1].called).to.equal(true);
      },
      'optionals': function(){

      },
      'reversing': function(){
        expect(this.router.build).to.throwError();
      },
      'group': function(){

      },
    },
    'afterEach': function(){
      this.router = null;
    }
  }
};