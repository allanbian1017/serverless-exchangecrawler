'use strict';

const AWS = require('aws-sdk');
const HttpClient = require('../lib/httpclient');
const CurrencySource = require('../lib/currencysource');
const CurrencyCache = require('../lib/currencycache');
const CurrencyHistory = require('../lib/currencyhistory');
const EventDispatcher = require('../lib/eventdispatcher');
const CrawlerService = require('./crawlerservice');

exports.main = (event, context, cb) => {
  console.log(event);

  const sns = new AWS.SNS();
  const s3 = new AWS.S3();
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const httpclient = new HttpClient();
  const src = new CurrencySource({ client: httpclient });
  const cache = new CurrencyCache({ db: dynamodb });
  const history = new CurrencyHistory({ storage: s3 });
  const eventdispatcher = new EventDispatcher({ sns: sns, arns: {currencychanged: process.env.CURRENCY_CHANGED_SNS_ARN} });
  const service = new CrawlerService({ cache: cache, src: src, history: history, eventdispatcher: eventdispatcher });
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

