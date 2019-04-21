'use strict';

const moment = require('moment');
const Storage = require('../base/storage');
const Currency = require('../store/currency');
const BigQuery = require('../base/bigquery');
const logger = require('../base/logger');
const Context = require('../base/context');

const storage = new Storage();
const store = new Currency({
  storage: storage,
});

let context = new Context({
  logger: logger,
});

const bq = new BigQuery('', '', '');

// Since Google BigQuery only accept timestamp in the past 365 days,
//   therefore we find the date start from 1 years ago
//
//   Google BigQuery error message:
//   You can only stream to date range within 365 days in the past
//   and 183 days in the future relative to the current date
let from = moment()
  .subtract(1, 'y')
  .add(1, 'd');
let now = moment();

let dates = [];
for (let m = from; m.isBefore(now); m.add(1, 'days')) {
  let day = m.toDate().getDay();
  let isWeekend = day == 6 || day == 0;
  if (isWeekend === false) {
    dates.push(m.format('YYYYMMDD'));
  }
}

let p = [];
dates.forEach((date) => {
  p.push(
    store
      .getHistory(context, 'BOT', date)
      .then((data) => {
        if (data.length !== 0) {
          let rows = [];
          data.forEach((item) => {
            rows.push({
              timestamp: moment(item.date).unix(),
              USD: item.USD,
              HKD: item.HKD,
              GBP: item.GBP,
              AUD: item.AUD,
              JPY: item.JPY,
              EUR: item.EUR,
              KRW: item.KRW,
              CNY: item.CNY,
            });
          });

          return bq.streamInsert(context, 'ExchangeRate', 'History', rows);
        }

        return Promise.resolve();
      })
      .catch((err) => {
        return Promise.reject(err);
      })
  );
});

//
Promise.all(p)
  .then(() => {
    console.log('done');
  })
  .catch((err) => {
    context.logger.log('error', 'unknown', {error: err});
  });
