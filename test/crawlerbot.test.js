const logger = require('../base/logger');
const Context = require('../base/context');
const Storage = require('../base/storage');
const Bot = require('../base/bot');
const Currency = require('../store/currency');
const Subscription = require('../store/subscription');
const CrawlerBot = require('../store/crawlerbot');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('CrawlerBot', function() {
  let storage;
  let currency;
  let bot;
  let subscription;
  let store;
  let context;

  before(function() {
    context = new Context({logger: logger});
    storage = new Storage();
    bot = new Bot();
    subscription = new Subscription({});
    currency = new Currency({});
    store = new CrawlerBot({
      storage: storage,
      bot: bot,
      currency: currency,
      subscription: subscription,
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
      const expectUsers = ['123', '456', '789'];

      sandbox
        .stub(subscription, 'listUsers')
        .withArgs(context, testPlat)
        .resolves(expectUsers)
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
      const expectMsg = '訂閱成功';

      sandbox
        .stub(subscription, 'addUser')
        .withArgs(context, testPlat, testUserId)
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
      const expectMsg = '取消訂閱成功';

      sandbox
        .stub(subscription, 'removeUser')
        .withArgs(context, testPlat, testUserId)
        .resolves()
        .withArgs()
        .rejects();

      return store
        .removeSubscribeUser(context, testPlat, testUserId)
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
