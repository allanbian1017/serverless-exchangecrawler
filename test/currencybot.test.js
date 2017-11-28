const CurrencyBot = require('../lib/currencybot');
const should = require('should');
const sinon = require('sinon');
const line = require('@line/bot-sdk');

describe('CurrencyBot', function() {
  let lineclient;
  let bot;

  before(function() {
    lineclient = new line.Client({
      channelAccessToken: 'xxx',
      channelSecret: 'xxx',
    });
    bot = new CurrencyBot({
      lineclient: lineclient,
    });
  });

  describe('#lineBotHandler()', function() {
    let sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should reply expected line message', function() {
      const expectMsg = '您好\n' +
                '美金匯率30\n' +
                '日元匯率0.27\n' +
                '澳幣匯率22\n' +
                '人民幣匯率4.5\n' +
                '供您参考';
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
      sandbox.mock(lineclient)
        .expects('replyMessage').once()
        .withArgs(
          testBody.events[0].replyToken,
          {type: 'text', text: expectMsg}
        );

      return bot.lineBotHandler(testBody, {default: expectMsg})
        .then(function(data) {
          sandbox.verify();
          return Promise.resolve();
        });
    });
  });
});
