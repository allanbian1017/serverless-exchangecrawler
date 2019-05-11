const logger = require('../base/logger');
const Context = require('../base/context');
const Storage = require('../base/storage');
const Subscription = require('../store/subscription');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('Subscription', function() {
  let storage;
  let store;
  let context;

  before(function() {
    context = new Context({logger: logger});
    storage = new Storage();
    store = new Subscription({
      storage: storage,
    });
  });

  describe('#addUser()', function() {
    let sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should execute success without error', function() {
      const testPlat = 'line';
      const testUserId = '1234';
      const testObj = {
        Users: ['789'],
      };
      const expectBucket = 'currencybucket';
      const expectPath = 'Users/' + testPlat + '.json';
      const expectObj = {
        Users: ['789', testUserId],
      };

      sandbox
        .stub(storage, 'get')
        .withArgs(context, expectBucket, expectPath)
        .resolves(testObj)
        .withArgs()
        .rejects();
      sandbox
        .stub(storage, 'put')
        .withArgs(context, expectBucket, expectPath, expectObj)
        .resolves()
        .withArgs()
        .rejects();

      return store
        .addUser(context, testPlat, testUserId)
        .then(function() {
          return Promise.resolve();
        })
        .catch(function(err) {
          return Promise.reject(err);
        });
    });
  });

  describe('#removeUser()', function() {
    let sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should execute success without error', function() {
      const testPlat = 'line';
      const testUserId = '1234';
      const testObj = {
        Users: ['789', testUserId],
      };
      const expectBucket = 'currencybucket';
      const expectPath = 'Users/' + testPlat + '.json';
      const expectObj = {
        Users: ['789'],
      };

      sandbox
        .stub(storage, 'get')
        .withArgs(context, expectBucket, expectPath)
        .resolves(testObj)
        .withArgs()
        .rejects();
      sandbox
        .stub(storage, 'put')
        .withArgs(context, expectBucket, expectPath, expectObj)
        .resolves()
        .withArgs()
        .rejects();

      return store
        .removeUser(context, testPlat, testUserId)
        .then(function() {
          return Promise.resolve();
        })
        .catch(function(err) {
          return Promise.reject(err);
        });
    });
  });

  describe('#isUserInSubsctipion()', function() {
    let sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should return true', function() {
      const testPlat = 'line';
      const testUserId = '1234';
      const testObj = {
        Users: ['789', '1234'],
      };
      const expectBucket = 'currencybucket';
      const expectPath = 'Users/' + testPlat + '.json';

      sandbox
        .stub(storage, 'get')
        .withArgs(context, expectBucket, expectPath)
        .resolves(testObj)
        .withArgs()
        .rejects();

      return store
        .isUserInSubsctipion(context, testPlat, testUserId)
        .then(function(exist) {
          expect(exist).to.equal(true);
          return Promise.resolve();
        })
        .catch(function(err) {
          return Promise.reject(err);
        });
    });

    it('should return false', function() {
      const testPlat = 'line';
      const testUserId = '1234';
      const testObj = {
        Users: ['789'],
      };
      const expectBucket = 'currencybucket';
      const expectPath = 'Users/' + testPlat + '.json';

      sandbox
        .stub(storage, 'get')
        .withArgs(context, expectBucket, expectPath)
        .resolves(testObj)
        .withArgs()
        .rejects();

      return store
        .isUserInSubsctipion(context, testPlat, testUserId)
        .then(function(exist) {
          expect(exist).to.equal(false);
          return Promise.resolve();
        })
        .catch(function(err) {
          return Promise.reject(err);
        });
    });
  });
});
