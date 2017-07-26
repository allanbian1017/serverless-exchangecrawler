const CurrencyBot = require('../lib/currencybot');
const should = require('should');
const sinon = require('sinon');
const line = require('@line/bot-sdk');

describe('CurrencyBot', function() {
  const expectMsg = '您好\n' +
                '美金匯率30\n' +
                '日元匯率0.27\n' +
                '澳幣匯率22\n' +
                '人民幣匯率4.5\n' +
                '供您参考';
  const fixedBody = {
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
  var lineclient;
  var bot;

  before(function() {
    lineclient = new line.Client({ channelAccessToken: 'xxx', channelSecret: 'xxx'});
    bot = new CurrencyBot({ lineclient: lineclient, linesecret: 'xxx' });
  });

  describe('#lineBotHandler()', function() {
    var sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should reply expected line message', function() {
      sandbox.mock(lineclient)
        .expects('replyMessage').once()
        .withArgs(fixedBody.events[0].replyToken, {type: 'text', text: expectMsg});

      return bot.lineBotHandler({}, fixedBody, { default: expectMsg })
        .then(function(data) {
          sandbox.verify();
          return Promise.resolve();
        });
    });
  });
});
