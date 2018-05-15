'use strict';

const AWS = require('aws-sdk');
const moment = require('moment');
const CurrencyHistory = require('../lib/currencyhistory');

const s3 = new AWS.S3();
const history = new CurrencyHistory({storage: s3});

let from = moment(new Date(2017, 8, 21));
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
dates.forEach((d) => {
  p.push(
    history
      .get('BOT', d)
      .then((data) => {
        let items = [];

        if (data.length !== 0) {
          data.forEach((item) => {
            let newItem = item;
            let timestamp = moment(newItem.date).valueOf();
            newItem.date = timestamp;
            items.push(newItem);
          });

          return history.put('BOT', d, items);
        }

        return Promise.resolve();
      })
      .catch((err) => {
        console.error(err);
        if (err.code === 'NotFound') {
          return Promise.resolve();
        }

        return Promise.reject(err);
      })
  );
});

Promise.all(p)
  .then(() => {
    console.log('done');
  })
  .catch((err) => {
    console.error(err);
  });
