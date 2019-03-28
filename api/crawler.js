'use strict';

const Middleware = require('./middleware');
const KV = require('../base/kv');
const Storage = require('../base/storage');
const Event = require('../base/event');
const HttpClient = require('../base/httpclient');
const Currency = require('../store/currency');

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

exports.main = Middleware.handle((context) => {
  let event = context.event;
  context.logger.log('info', 'crawler start', event);

  Promise.resolve()
    .then(() => {
      let types = ['USD', 'JPY', 'AUD', 'CNY', 'KRW', 'EUR', 'GBP', 'HKD'];
      return store.crawlingCurrency(context, types);
    })
    .then(() => {
      context.cb();
    })
    .catch((err) => {
      context.logger.log('error', 'crawler error', err);
      context.cb(err);
    });
});
