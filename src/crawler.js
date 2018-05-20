'use strict';

const awsXRay = require('aws-xray-sdk');
const AWS = awsXRay.captureAWS(require('aws-sdk'));
const winston = require('winston');
const Metrics = require('../lib/metrics');
const HttpClient = require('../lib/httpclient');
const CurrencySource = require('../lib/currencysource');
const CurrencyCache = require('../lib/currencycache');
const CurrencyHistory = require('../lib/currencyhistory');
const EventDispatcher = require('../lib/eventdispatcher');
const CrawlerService = require('./crawlerservice');

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});
const sns = new AWS.SNS();
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const httpclient = new HttpClient();
const src = new CurrencySource({client: httpclient});
const cache = new CurrencyCache({db: dynamodb});
const history = new CurrencyHistory({storage: s3});
const eventdispatcher = new EventDispatcher({
  sns: sns,
  arns: {currencychanged: process.env.CURRENCY_CHANGED_SNS_ARN},
});
const metrics = new Metrics(process.env.DATADOG_API_KEY);
const service = new CrawlerService({
  cache: cache,
  src: src,
  history: history,
  eventdispatcher: eventdispatcher,
  metrics: metrics,
});

exports.main = (event, context, cb) => {
  logger.log('info', 'api request', event);

  let types = ['USD', 'JPY', 'AUD', 'CNY', 'KRW', 'EUR', 'GBP', 'HKD'];

  Promise.resolve()
    .then(function() {
      return service.crawlingCurrency(types);
    })
    .then(function() {
      cb();
    })
    .catch(function(err) {
      logger.log('error', 'api error', err);

      cb(err);
    });
};
