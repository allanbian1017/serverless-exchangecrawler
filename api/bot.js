'use strict';

const Middleware = require('./middleware');
const KV = require('../base/kv');
const Storage = require('../base/storage');
const Currency = require('../store/currency');
const Subscription = require('../store/subscription');
const CrawlerBot = require('../store/crawlerbot');

const storage = new Storage();
const kv = new KV();
const currency = new Currency({
  storage: storage,
  kv: kv,
});
const subscription = new Subscription({
  storage: storage,
});
const store = new CrawlerBot({
  currency: currency,
  subscription: subscription,
});

exports.main = Middleware.handle((context) => {
  let event = context.event;
  context.logger.log('info', 'api request', event);

  const body = JSON.parse(event.body);
  let response = {};

  if (!body.queryResult || !body.queryResult.action) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: 'Bad Request',
    });
    return context.cb(null, response);
  }

  Promise.resolve()
    .then(() => {
      let action = body.queryResult.action;
      if (action === 'query.currency') {
        if (
          !body.queryResult.parameters ||
          !body.queryResult.parameters.CurrencyType
        ) {
          response.statusCode = 400;
          response.body = JSON.stringify({
            message: 'Bad Request',
          });
          return context.cb(null, response);
        }

        let types = [body.queryResult.parameters.CurrencyType];
        return store.queryCurrency(context, types);
      } else if (action === 'query.currency.all') {
        let types = ['USD', 'JPY', 'AUD', 'CNY', 'KRW', 'EUR', 'GBP', 'HKD'];
        return store.queryCurrency(context, types);
      } else if (action === 'subscription.subscribe') {
        let plat = body.originalDetectIntentRequest.source;
        let userID = body.originalDetectIntentRequest.data.source.userId;
        return store.addSubscribeUser(context, plat, userID);
      } else if (action === 'subscription.unsubscribe') {
        let plat = body.originalDetectIntentRequest.source;
        let userID = body.originalDetectIntentRequest.data.source.userId;
        return store.removeSubscribeUser(context, plat, userID);
      } else {
        return Promise.resolve({text: '我不懂'});
      }
    })
    .then((data) => {
      response.statusCode = 200;
      response.body = JSON.stringify({
        fulfillmentText: data.text,
      });

      context.logger.log('info', 'api response', response);
      context.cb(null, response);
    })
    .catch((err) => {
      context.logger.log('error', 'api error', err);
      context.cb(err);
    });
});
