'use strict';

const logger = require('../base/logger');
const Storage = require('../base/storage');
const Bot = require('../base/bot');
const CrawlerBot = require('../store/crawlerbot');

const storage = new Storage();
const bot = new Bot();
const store = new CrawlerBot({
  bot: bot,
  storage: storage,
});

exports.main = (event, context, cb) => {
  logger.log('info', 'pub start', event);

  Promise.resolve()
    .then(() => {
      let p = event.Records.map((x) => {
        return x.Sns;
      }).map((x) => {
        let currency = JSON.parse(x.Message);
        return store.broadcastCurrency('line', currency);
      });

      return Promise.all(p);
    })
    .then(() => {
      cb();
    })
    .catch((err) => {
      logger.log('error', 'pub error', err);
      cb(err);
    });
};
