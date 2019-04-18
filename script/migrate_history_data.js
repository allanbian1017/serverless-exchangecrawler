'use strict';

const moment = require('moment-timezone');
const Storage = require('../base/storage');
const Currency = require('../store/currency');
const logger = require('../base/logger');
const Context = require('../base/context');

const storage = new Storage();
const store = new Currency({
  storage: storage,
});

let context = new Context({
  logger: logger,
});

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
dates.forEach((date) => {
  p.push(
    store
      .getHistory(context, 'BOT', date)
      .then((data) => {
        if (data.length !== 0) {
          let items = [];
          data.forEach((item) => {
            let newItem = item;
            // since current timestamp has +8 hour offset compare to
            //   UTC timestamp, we need correct UTC timestamp,
            //   therefore we modify timestamp by shift -8 hour to
            //   current timestamp
            let timestamp = moment(newItem.date)
              .subtract(8, 'h')
              .valueOf();
            newItem.date = timestamp;
            items.push(newItem);
          });

          return store.putHistory(context, 'BOT', date, items);
        }

        return Promise.resolve();
      })
      .catch((err) => {
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
