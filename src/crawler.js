'use strict';

const AWS = require('aws-sdk');
const HttpClient = require('../lib/httpclient');
const CurrencySource = require('../lib/currencysource');
const CurrencyHist = require('../lib/currencyhistory');
const CurrencyBot = require('../lib/currencybot');
const BotUser = require('../lib/botuser');
const Config = require('../lib/config');
const CrawlerService = require('./crawlerservice');
const line = require('@line/bot-sdk');

exports.main = (event, context, cb) => {
  console.log(event);

  const s3 = new AWS.S3();
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const httpclient = new HttpClient();
  const src = new CurrencySource({ client: httpclient });
  const history = new CurrencyHist({ db: dynamodb });
  const config = Config.get(process.env.AWS_REGION);
  const client = new line.Client(config.line_config);
  const botuser = new BotUser({ storage: s3 });
  const bot = new CurrencyBot({ lineclient: client, botuser: botuser });
  const service = new CrawlerService({ bot: bot, history: history, src: src });
  let types = ['USD', 'JPY', 'AUD', 'CNY', 'KRW', 'EUR', 'GBP', 'HKD'];

  Promise.resolve()
    .then(function() {
      return service.crawlingCurrency(types);
    })
    .then(function(data) {
      cb();
    })
    .catch(function(err) {
      console.log(err);

      cb(err);
    });
};

