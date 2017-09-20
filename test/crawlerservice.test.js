const Currency = require('../lib/currency');
const CurrencyHist = require('../lib/currencyhistory');
const CurrencyBot = require('../lib/currencybot');
const CrawlerService = require('../src/crawlerservice');
const should = require('should');
const sinon = require('sinon');

describe('CrawlerService', function() {
  let currency;
  let history;
  let bot;
  let service;

  before(function() {
    currency = new Currency({ client: '' });
    history = new CurrencyHist({ db: '' });
    bot = new CurrencyBot({ lineclient: '', botuser: '' });
    service = new CrawlerService({ bot: bot, history: history, currency: currency });
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
          CNY: 4.5
        }
      };
       const testBody = {
        events: [
          {
            "replyToken": "nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
            "type": "message",
            "timestamp": 1462629479859,
            "source": {
              "type": "user",
              "userId": "U206d25c2ea6bd87c17655609a1c37cb8"
            },
            "message": {
              "id": "325708",
              "type": "text",
              "text": "Hello, world"
            }
          }
        ]
      };
      sandbox.stub(history, 'get')
        .withArgs('BOT').resolves(testHist)
        .withArgs().rejects();
      sandbox.mock(bot)
        .expects('lineBotHandler').once()
        .withArgs(testBody, {default: expectMsg});

      return service.processLineEvents(testBody)
        .then(function(data) {
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
      const expectMsg = '您好\n' +
                '美金匯率30\n' +
                '日元匯率0.27\n' +
                '澳幣匯率22\n' +
                '人民幣匯率4.5\n' +
                '更新時間:2017-09-20 10:04\n' +
                '供您参考';
      const testTypes = ['USD', 'JPY'];
      const testHist = {
        bank: 'BOT',
        data: {
          date: '2017-09-19T14:04:00+00:00',
          USD: 30,
          JPY: 0.27,
          AUD: 22,
          CNY: 4.5
        }
      };

      const testCur = {
        date: '2017-09-20T14:04:00+00:00',
        USD: 30,
        JPY: 0.27,
        AUD: 22,
        CNY: 4.5
      };

      sandbox.stub(currency, 'query')
        .withArgs({ types: testTypes }).resolves(testCur)
        .withArgs().rejects();
      sandbox.stub(history, 'get')
        .withArgs('BOT').resolves(testHist)
        .withArgs().rejects();
      sandbox.mock(history)
        .expects('put').once()
        .withArgs('BOT', testCur);
      sandbox.mock(bot)
        .expects('lineBotPublish').once()
        .withArgs(expectMsg);

      return service.crawlingCurrency(testTypes)
        .then(function(data) {
          sandbox.verify();
          return Promise.resolve();
        });
    });
  });
});
