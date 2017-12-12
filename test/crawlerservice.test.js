const CurrencySource = require('../lib/currencysource');
const CurrencyCache = require('../lib/currencycache');
const CurrencyBot = require('../lib/currencybot');
const CurrencyHistory = require('../lib/currencyhistory');
const EventDispatcher = require('../lib/eventdispatcher');
const CrawlerService = require('../src/crawlerservice');
const should = require('should');
const sinon = require('sinon');

describe('CrawlerService', function() {
  let src;
  let cache;
  let bot;
  let history;
  let eventdispatcher;
  let service;

  before(function() {
    src = new CurrencySource({client: ''});
    cache = new CurrencyCache({db: ''});
    bot = new CurrencyBot({lineclient: '', botuser: ''});
    history = new CurrencyHistory({storage: ''});
    eventdispatcher = new EventDispatcher({sns: '', arns: ''});
    service = new CrawlerService({
      bot: bot,
      cache: cache,
      src: src,
      history: history,
      eventdispatcher: eventdispatcher,
    });
  });

  describe('#processLineEvents()', function() {
    let sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should execute success without error', function() {
      const expectMsg = '您好\n' +
                '美金匯率30\n' +
                '日元匯率0.27\n' +
                '澳幣匯率22\n' +
                '人民幣匯率4.5\n' +
                '更新時間:2017-09-20 10:04\n' +
                '供您参考';
      const testHist = {
        bank: 'BOT',
        data: {
          date: '2017-09-20T14:04:00+00:00',
          USD: 30,
          JPY: 0.27,
          AUD: 22,
          CNY: 4.5,
        },
      };
       const testBody = {
        events: [
          {
            'replyToken': 'nHuyWiB7yP5Zw52FIkcQobQuGDXCTA',
            'type': 'message',
            'timestamp': 1462629479859,
            'source': {
              'type': 'user',
              'userId': 'U206d25c2ea6bd87c17655609a1c37cb8',
            },
            'message': {
              'id': '325708',
              'type': 'text',
              'text': 'Hello, world',
            },
          },
        ],
      };
      sandbox.stub(cache, 'get')
        .withArgs('BOT').resolves(testHist)
        .withArgs().rejects();
      sandbox.mock(bot)
        .expects('lineBotHandler').once()
        .withArgs(testBody, {default: expectMsg});

      return service.processLineEvents(testBody)
        .then(function() {
          sandbox.verify();
          return Promise.resolve();
        });
    });
  });

  describe('#processLinePublishEvents()', function() {
    let sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should execute success without error', function() {
      const expectMsg = '您好\n' +
                '美金匯率30\n' +
                '日元匯率0.27\n' +
                '澳幣匯率22\n' +
                '人民幣匯率4.5\n' +
                '更新時間:2017-09-20 10:04\n' +
                '供您参考';
      const testEvents = [
        {
          Message: JSON.stringify({
            date: '2017-09-20T14:04:00+00:00',
            USD: 30,
            JPY: 0.27,
            AUD: 22,
            CNY: 4.5,
          }),
        },
      ];

      sandbox.mock(bot)
        .expects('lineBotPublish').once()
        .withArgs(expectMsg);

      return service.processLinePublishEvents(testEvents)
        .then(function() {
          sandbox.verify();
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
          date: '2017-09-19T14:04:00+00:00',
          USD: 30,
          JPY: 0.27,
          AUD: 22,
          CNY: 4.5,
        },
      };

      const testCur = {
        date: '2017-09-20T14:04:00+00:00',
        USD: 30,
        JPY: 0.27,
        AUD: 22,
        CNY: 4.5,
      };

      sandbox.stub(src, 'query')
        .withArgs({types: testTypes}).resolves(testCur)
        .withArgs().rejects();
      sandbox.stub(cache, 'get')
        .withArgs('BOT').resolves(testHist)
        .withArgs().rejects();
      sandbox.mock(history)
        .expects('add').once()
        .withArgs('BOT', expectDate, testCur);
      sandbox.mock(cache)
        .expects('put').once()
        .withArgs('BOT', testCur);
      sandbox.mock(eventdispatcher)
        .expects('dispatchCurrencyChangedEvent').once()
        .withArgs(testCur);

      return service.crawlingCurrency(testTypes)
        .then(function() {
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
            date: '2017-09-20T14:04:00+00:00',
            USD: 30,
            JPY: 0.27,
            AUD: 22,
            CNY: 4.5,
          }),
        },
      ];

      sandbox.stub(history, 'get')
        .withArgs('BOT', testDate).resolves(expectData)
        .withArgs().rejects();

      return service.fetchHistory(testDate)
        .then(function(data) {
          data.should.be.exactly(expectData);
          return Promise.resolve();
        });
    });
  });
});
