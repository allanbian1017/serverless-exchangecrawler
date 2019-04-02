'use strict';

const Middleware = require('./middleware');
const Storage = require('../base/storage');
const Currency = require('../store/currency');
const Bot = require('../base/bot');
const CrawlerBot = require('../store/crawlerbot');

const storage = new Storage();
const bot = new Bot();
const currency = new Currency({});
const store = new CrawlerBot({
  bot: bot,
  storage: storage,
});

exports.main = Middleware.handle((context) => {
  let event = context.event;
  context.logger.log('info', 'pub start', event);

  Promise.resolve()
    .then(() => {
      let p = event.Records.filter((x) => {
        return x.dynamodb && x.dynamodb.NewImage;
      })
        .map((x) => {
          let record = x.dynamodb.NewImage;
          return currency.parseCurrencyFromDynamoDBStream(context, record);
        })
        .filter((x) => {
          return Object.keys(x).length > 0;
        })
        .map((x) => {
          return store.broadcastCurrency(context, 'line', x);
        });

      return Promise.all(p);
    })
    .then(() => {
      context.cb();
    })
    .catch((err) => {
      context.logger.log('error', 'pub error', err);
      context.cb(err);
    });
});
