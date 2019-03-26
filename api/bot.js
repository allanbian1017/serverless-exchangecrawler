'use strict';

const logger = require('../base/logger');
const KV = require('../base/kv');
const Storage = require('../base/storage');
const Currency = require('../store/currency');
const CrawlerBot = require('../store/crawlerbot');

const storage = new Storage();
const kv = new KV();
const currency = new Currency({
  storage: storage,
  kv: kv,
});
const store = new CrawlerBot({
  currency: currency,
  storage: storage,
});

exports.main = (event, context, cb) => {
  logger.log('info', 'api request', event);

  const body = JSON.parse(event.body);
  let response = {};

  if (!body.result || !body.result.action) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: 'Bad Request',
    });
    return cb(null, response);
  }

  Promise.resolve()
    .then(() => {
      if (body.result.action === 'query.currency') {
        if (!body.result.parameters || !body.result.parameters.CurrencyType) {
          response.statusCode = 400;
          response.body = JSON.stringify({
            message: 'Bad Request',
          });
          return cb(null, response);
        }

        let types = [body.result.parameters.CurrencyType];
        return store.queryCurrency(types);
      } else if (body.result.action === 'query.currency.all') {
        let types = ['USD', 'JPY', 'AUD', 'CNY', 'KRW', 'EUR', 'GBP', 'HKD'];
        return store.queryCurrency(types);
      } else if (body.result.action === 'subscription.subscribe') {
        let plat = body.originalRequest.source;
        let userID = body.originalRequest.data.source.userId;
        return store.addSubscribeUser(plat, userID);
      } else if (body.result.action === 'subscription.unsubscribe') {
        let plat = body.originalRequest.source;
        let userID = body.originalRequest.data.source.userId;
        return store.delSubscribeUser(plat, userID);
      } else {
        return Promise.resolve({text: '我不懂'});
      }
    })
    .then((data) => {
      response.statusCode = 200;
      response.body = JSON.stringify({
        speech: data.text,
        displayText: data.text,
      });

      logger.log('info', 'api response', response);
      cb(null, response);
    })
    .catch((err) => {
      logger.log('error', 'api error', err);
      cb(err);
    });
};
