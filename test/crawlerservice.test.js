const CurrencySource = require('../lib/currencysource');
const CurrencyCache = require('../lib/currencycache');
const CurrencyHistory = require('../lib/currencyhistory');
const LineBot = require('../lib/linebot');
const EventDispatcher = require('../lib/eventdispatcher');
const BotUser = require('../lib/botuser');
const CrawlerService = require('../src/crawlerservice');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('CrawlerService', function() {
  let src;
  let cache;
  let bot;
  let history;
  let eventdispatcher;
  let botuser;
  let service;

  before(function() {
    process.env.DATADOG_API_KEY = 'justfortest';
    src = new CurrencySource({client: ''});
    cache = new CurrencyCache({db: ''});
    bot = new LineBot({lineclient: '', botuser: ''});
    history = new CurrencyHistory({storage: ''});
    eventdispatcher = new EventDispatcher({sns: '', arns: ''});
    botuser = new BotUser({storage: ''});
    service = new CrawlerService({
      bot: bot,
      cache: cache,
      src: src,
      history: history,
      eventdispatcher: eventdispatcher,
      botuser: botuser,
    });
  });

  describe('#publishEvents()', function() {
    let sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should execute success without error', function() {
      const expectMsg =
        '您好\n' +
        '美金匯率30\n' +
        '日元匯率0.27\n' +
        '澳幣匯率22\n' +
        '人民幣匯率4.5\n' +
        '更新時間:2017-09-20 10:04\n' +
        '供您参考';
      const testEvents = [
        {
          Message: JSON.stringify({
            date: 1505901840000,
            USD: 30,
            JPY: 0.27,
            AUD: 22,
            CNY: 4.5,
          }),
        },
      ];

      sandbox
        .mock(bot)
        .expects('publish')
        .once()
        .withArgs(expectMsg);

      return service.publishEvents(testEvents).then(function() {
        sandbox.verify();
        return Promise.resolve();
      });
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
        bank: 'BOT',
        data: {
          date: 1505901840000,
          USD: 30,
          JPY: 0.27,
          AUD: 22,
          CNY: 4.5,
        },
      };

      sandbox
        .stub(cache, 'get')
        .withArgs('BOT')
        .resolves(testHist)
        .withArgs()
        .rejects();

      return service.queryCurrency(testTypes).then(function(data) {
        expect(data.text).to.equal(expectMsg);
        return Promise.resolve();
      });
    });
  });

  describe('#crawlingCurrency()', function() {
    let sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should execute success without error', function() {
      const expectDate = '20170920';
      const testTypes = ['USD', 'JPY'];
      const testHist = {
        bank: 'BOT',
        data: {
          date: 1505829840000,
          USD: 30,
          JPY: 0.27,
          AUD: 22,
          CNY: 4.5,
        },
      };

      const testCur = {
        date: 1505916240000,
        USD: 30,
        JPY: 0.27,
        AUD: 22,
        CNY: 4.5,
      };

      sandbox
        .stub(src, 'query')
        .withArgs({types: testTypes})
        .resolves(testCur)
        .withArgs()
        .rejects();
      sandbox
        .stub(cache, 'get')
        .withArgs('BOT')
        .resolves(testHist)
        .withArgs()
        .rejects();
      sandbox
        .mock(history)
        .expects('add')
        .once()
        .withArgs('BOT', expectDate, testCur);
      sandbox
        .mock(cache)
        .expects('put')
        .once()
        .withArgs('BOT', testCur);
      sandbox
        .mock(eventdispatcher)
        .expects('dispatchCurrencyChangedEvent')
        .once()
        .withArgs(testCur);

      return service.crawlingCurrency(testTypes).then(function() {
        sandbox.verify();
        return Promise.resolve();
      });
    });
  });

  describe('#fetchHistory()', function() {
    let sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should execute success without error', function() {
      const testDate = '20170920';
      const expectData = [
        {
          Message: JSON.stringify({
            date: 1505829840000,
            USD: 30,
            JPY: 0.27,
            AUD: 22,
            CNY: 4.5,
          }),
        },
      ];

      sandbox
        .stub(history, 'get')
        .withArgs('BOT', testDate)
        .resolves(expectData)
        .withArgs()
        .rejects();

      return service.fetchHistory(testDate).then(function(data) {
        expect(data).to.equal(expectData);
        return Promise.resolve();
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
        .stub(botuser, 'add')
        .withArgs(testPlat, testUserId)
        .resolves()
        .withArgs()
        .rejects();

      return service
        .addSubscribeUser(testPlat, testUserId)
        .then(function(data) {
          expect(data.text).to.equal(expectMsg);
          return Promise.resolve();
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
        .stub(botuser, 'del')
        .withArgs(testPlat, testUserId)
        .resolves()
        .withArgs()
        .rejects();

      return service
        .delSubscribeUser(testPlat, testUserId)
        .then(function(data) {
          expect(data.text).to.equal(expectMsg);
          return Promise.resolve();
        });
    });
  });
});
