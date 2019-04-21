'use strict';

const moment = require('moment');
const Middleware = require('./middleware');
const Currency = require('../store/currency');
const BigQuery = require('../base/bigquery');

const bq = new BigQuery(
  process.env.GCP_PROJECT_ID,
  process.env.GCP_CLIENT_EMAIL,
  process.env.GCP_PRIVATE_KEY.replace(new RegExp('\\\\n', 'g'), '\n')
);
const currency = new Currency({});

exports.main = Middleware.handle((context) => {
  let event = context.event;
  context.logger.log('info', 'bq start', event);

  Promise.resolve()
    .then(() => {
      let rows = event.Records.filter((x) => {
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
          return {
            timestamp: moment(x.date).unix(),
            USD: x.USD,
            HKD: x.HKD,
            GBP: x.GBP,
            AUD: x.AUD,
            JPY: x.JPY,
            EUR: x.EUR,
            KRW: x.KRW,
            CNY: x.CNY,
          };
        });

      return bq.streamInsert(null, 'ExchangeRate', 'History', rows);
    })
    .then(() => {
      context.logger.log('info', 'bq done');
      context.cb();
    })
    .catch((err) => {
      context.logger.log('error', 'bq error', err);
      context.cb(err);
    });
});
