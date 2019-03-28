'use strict';

const Middleware = require('./middleware');
const Storage = require('../base/storage');
const Bot = require('../base/bot');
const CrawlerBot = require('../store/crawlerbot');

const storage = new Storage();
const bot = new Bot();
const store = new CrawlerBot({
  bot: bot,
  storage: storage,
});

exports.main = Middleware.handle((context) => {
  let event = context.event;
  context.logger.log('info', 'pub start', event);

  Promise.resolve()
    .then(() => {
      let p = event.Records.map((x) => {
        return x.Sns;
      }).map((x) => {
        let currency = JSON.parse(x.Message);
        return store.broadcastCurrency(context, 'line', currency);
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
