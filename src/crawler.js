'use strict';

const AWS = require('aws-sdk');
const HttpClient = require('../lib/httpclient');
const Currency = require('../lib/currency');
const CurrencyHist = require('../lib/currencyhistory');
const CurrencyBot = require('../lib/currencybot');
const BotUser = require('../lib/botuser');
const Config = require('../lib/config');
const line = require('@line/bot-sdk');
const moment = require('moment');

exports.main = (event, context, cb) => {
  console.log(event);

  const s3 = new AWS.S3();
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const httpclient = new HttpClient();
  const currency = new Currency({ client: httpclient });
  const history = new CurrencyHist({ db: dynamodb });
  const config = Config.get(process.env.AWS_REGION);
  const client = new line.Client(config.line_config);
  const botuser = new BotUser({ storage: s3 });
  const bot = new CurrencyBot({ lineclient: client, botuser: botuser });
  let cur = {};

  currency.query({ types: ['USD', 'JPY', 'AUD', 'CNY', 'KRW', 'EUR', 'GBP', 'HKD'] })
    .then(function(data) {
      cur = data;

      return history.get('BOT');
    })
    .then(function(data) {
      if (new Date(cur.date) > new Date(data.data.date)) {
        return updateCurrency(history, bot, cur);
      }

      return Promise.resolve();
    })
    .then(function(data) {
      cb();
    })
    .catch(function(err) {
      console.log(err);

      cb(err);
    });
};

function updateCurrency(history, bot, data) {
  const ids = [
    'Uc5eb6efd53fe44b958128cf98b873fe9', 
    'U765f72b839c13144dd8e6ace73433e28', 
    'Ua0293a371781d17ced98ec2978dd25a3', 
    'U7f5e10551c63fe184d4f19a92f7a8141', 
    'U7dcd7cf0061f4d1807bdfefb43c99446',
    'Uf36890f48d1fbd41e69e2688e5b24e32',
    'U4799b2bfc72d72411520a17b376b949f'
  ];

  return history.put('BOT', data)
    .then(function() {
      return bot.lineBotPublish(getCurrencyMsg(data));
    });
}

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
