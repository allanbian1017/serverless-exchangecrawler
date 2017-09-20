const CurrencySource = require('../lib/currencysource');
const CurrencyInfo = require('../lib/currencyinfo');
const CurrencyBot = require('../lib/currencybot');
const CrawlerService = require('../src/crawlerservice');
const should = require('should');
const sinon = require('sinon');

describe('CrawlerService', function() {
  let src;
  let info;
  let bot;
  let service;

  before(function() {
    src = new CurrencySource({ client: '' });
    info = new CurrencyInfo({ db: '' });
    bot = new CurrencyBot({ lineclient: '', botuser: '' });
    service = new CrawlerService({ bot: bot, info: info, src: src });
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
      sandbox.stub(info, 'get')
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

      sandbox.stub(src, 'query')
        .withArgs({ types: testTypes }).resolves(testCur)
        .withArgs().rejects();
      sandbox.stub(info, 'get')
        .withArgs('BOT').resolves(testHist)
        .withArgs().rejects();
      sandbox.mock(info)
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
