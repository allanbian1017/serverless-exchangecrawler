'use strict';

const winston = require('winston');
const LogzIO = require('winston-logzio');
const KV = require('../base/kv');
const Storage = require('../base/storage');
const Event = require('../base/event');
const HttpClient = require('../base/httpclient');
const Currency = require('../store/currency');

const logZIOTransport = new LogzIO({
  token: process.env.LOGZIO_TOKEN,
});
const logger = new winston.Logger({
  transports: [new winston.transports.Console(), logZIOTransport],
});
const event = new Event();
const httpclient = new HttpClient();
const kv = new KV();
const storage = new Storage();
const store = new Currency({
  kv: kv,
  storage: storage,
  event: event,
  currencyChangedTopic: process.env.CURRENCY_CHANGED_SNS_ARN,
  client: httpclient,
});

exports.main = (event, context, cb) => {
  logger.log('info', 'crawler start', event);

  Promise.resolve()
    .then(() => {
      let types = ['USD', 'JPY', 'AUD', 'CNY', 'KRW', 'EUR', 'GBP', 'HKD'];
      return store.crawlingCurrency(types);
    })
    .then(() => {
      logZIOTransport.flush();
      cb();
    })
    .catch((err) => {
      logger.log('error', 'crawler error', err);
      logZIOTransport.flush();
      cb(err);
    });
};
