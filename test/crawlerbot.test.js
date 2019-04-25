const logger = require('../base/logger');
const Context = require('../base/context');
const Storage = require('../base/storage');
const Bot = require('../base/bot');
const Currency = require('../store/currency');
const CrawlerBot = require('../store/crawlerbot');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('CrawlerBot', function() {
  let storage;
  let currency;
  let bot;
  let store;
  let context;

  before(function() {
    context = new Context({logger: logger});
    storage = new Storage();
    bot = new Bot();
    currency = new Currency({});
    store = new CrawlerBot({
      storage: storage,
      currency: currency,
      bot: bot,
    });
  });

  describe('#queryCurrency()', function() {
    let sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should execute success without error', function() {
      const testTypes = ['USD'];
      const expectMsg =
        '您好\n' + '美金匯率30\n' + '更新時間:2017-09-20 10:04\n' + '供您参考';
      const testHist = {
        date: 1505873040000,
        USD: 30,
        JPY: 0.27,
        AUD: 22,
        CNY: 4.5,
      };

      sandbox
        .stub(currency, 'getCurrency')
        .withArgs(context, 'BOT')
        .resolves(testHist)
        .withArgs()
        .rejects();

      return store
        .queryCurrency(context, testTypes)
        .then(function(data) {
          expect(data.text).to.equal(expectMsg);
          return Promise.resolve();
        })
        .catch(function(err) {
          return Promise.reject(err);
        });
    });
  });

  describe('#broadcastCurrency()', function() {
    let sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should execute success without error', function() {
      const testCurrency = {
        date: 1505873040000,
        USD: 30,
        JPY: 0.27,
        AUD: 22,
        CNY: 4.5,
      };
      const testPlat = 'line';
      const expectMsg =
        '您好\n' +
        '美金匯率30\n' +
        '日元匯率0.27\n' +
        '澳幣匯率22\n' +
        '人民幣匯率4.5\n' +
        '更新時間:2017-09-20 10:04\n' +
        '供您参考';
      const expectObj = {
        Users: ['123', '456', '789'],
      };
      const expectUsers = ['123', '456', '789'];
      const expectBucket = 'currencybucket';
      const expectPath = 'Users/' + testPlat + '.json';

      sandbox
        .stub(storage, 'get')
        .withArgs(context, expectBucket, expectPath)
        .resolves(expectObj)
        .withArgs()
        .rejects();
      sandbox
        .mock(bot)
        .expects('publish')
        .once()
        .withArgs(context, testPlat, expectUsers, expectMsg);

      return store
        .broadcastCurrency(context, testPlat, testCurrency)
        .then(function() {
          sandbox.verify();
          return Promise.resolve();
        })
        .catch(function(err) {
          return Promise.reject(err);
        });
    });
  });

  describe('#addSubscribeUser()', function() {
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
      const expectMsg = '訂閱成功';

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
        .addSubscribeUser(context, testPlat, testUserId)
        .then(function(data) {
          expect(data.text).to.equal(expectMsg);
          return Promise.resolve();
        })
        .catch(function(err) {
          return Promise.reject(err);
        });
    });
  });

  describe('#delSubscribeUser()', function() {
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
      const expectMsg = '取消訂閱成功';

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
        .delSubscribeUser(context, testPlat, testUserId)
        .then(function(data) {
          expect(data.text).to.equal(expectMsg);
          return Promise.resolve();
        })
        .catch(function(err) {
          return Promise.reject(err);
        });
    });
  });
});
