'use strict';

const moment = require('moment');
const Middleware = require('./middleware');
const Storage = require('../base/storage');
const Currency = require('../store/currency');
const BigQuery = require('../base/bigquery');

const bq = new BigQuery(
  process.env.GCP_PROJECT_ID,
  process.env.GCP_CLIENT_EMAIL,
  process.env.GCP_PRIVATE_KEY.replace(new RegExp('\\\\n', 'g'), '\n')
);
const storage = new Storage();
const currency = new Currency({
  storage: storage,
});

exports.main = Middleware.handle((context) => {
  let event = context.event;
  context.logger.log('info', 'add history start', event);

  Promise.resolve()
    .then(() => {
      let rows = [];
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
          let time = moment(x.date);
          rows.push({
            timestamp: time.unix(),
            USD: x.USD,
            HKD: x.HKD,
            GBP: x.GBP,
            AUD: x.AUD,
            JPY: x.JPY,
            EUR: x.EUR,
            KRW: x.KRW,
            CNY: x.CNY,
          });

          return currency.addHistory(
            context,
            x.Bank,
            time.format('YYYYMMDD'),
            x
          );
        });

      p.push(bq.streamInsert(null, 'ExchangeRate', 'History', rows));

      return Promise.all(p);
    })
    .then(() => {
      context.logger.log('info', 'add history done');
      context.cb();
    })
    .catch((err) => {
      context.logger.log('error', 'add history error', err);
      context.cb(err);
    });
});
