'use strict';

const AWS = require('aws-sdk');
const HttpClient = require('../lib/httpclient');
const Currency = require('../lib/currency');
const CurrencyBot = require('../lib/currencybot');
const BotUser = require('../lib/botuser');
const Config = require('../lib/config');
const line = require('@line/bot-sdk');
const moment = require('moment');

exports.main = (event, context, cb) => {
  console.log(event);

  const s3 = new AWS.S3();
  const httpclient = new HttpClient();
  const currency = new Currency({ client: httpclient });
  const config = Config.get(process.env.AWS_REGION);
  const client = new line.Client(config.line_config);
  const botuser = new BotUser({ storage: s3 });
  const bot = new CurrencyBot({ lineclient: client, botuser: botuser });
  const body = JSON.parse(event.body);
  let response = {};

  if (!line.validateSignature(new Buffer(event.body, 'utf-8'), config.line_config.channelSecret, event.headers['X-Line-Signature'])) {
    console.log('HMAC Error');
    response.statusCode = 403;
    response.body = JSON.stringify({
      message: 'Forbidden'
    });
    return cb(null, response);
  }

  currency.query({ types: ['USD', 'JPY', 'AUD', 'CNY', 'KRW', 'EUR', 'GBP', 'HKD'] })
    .then(function(data) {
      return bot.lineBotHandler(event.headers, body, { default: getCurrencyMsg(data) });
    })
    .then(function(data) {
      response.statusCode = 200;
      cb(null, response);
    })
    .catch(function(err) {
      console.log(err);

      cb(err);
    });
};

function getCurrencyMsg(data) {
  let msg = '您好\n';

  if (data.USD) msg += '美金匯率' + data.USD + '\n';
  if (data.JPY) msg += '日元匯率' + data.JPY + '\n';
  if (data.AUD) msg += '澳幣匯率' + data.AUD + '\n';
  if (data.CNY) msg += '人民幣匯率' + data.CNY + '\n';
  if (data.KRW) msg += '韓元匯率' + data.KRW + '\n';
  if (data.EUR) msg += '歐元匯率' + data.EUR + '\n';
  if (data.GBP) msg += '英鎊匯率' + data.GBP + '\n';
  if (data.HKD) msg += '港幣匯率' + data.HKD + '\n';

  msg += '更新時間:' + moment(data.date).format('YYYY-MM-DD hh:mm') + '\n';
  msg += '供您参考';
  return msg;
}
