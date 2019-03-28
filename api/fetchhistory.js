'use strict';

const Middleware = require('./middleware');
const moment = require('moment');
const Storage = require('../base/storage');
const Currency = require('../store/currency');

const storage = new Storage();
const store = new Currency({
  storage: storage,
});

exports.main = Middleware.handle((context) => {
  let event = context.event;
  context.logger.log('info', 'api request', event);

  let response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };

  Promise.resolve()
    .then(() => {
      let bank = 'BOT';
      let date = event.path.date;
      return store.getHistory(context, bank, date);
    })
    .then((data) => {
      if (moment().format('YYYYMMDD') !== event.path.date) {
        response.headers['cache-control'] = 'public, max-age=31536000';
      } else {
        response.headers['cache-control'] = 'public, max-age=1800';
      }

      response.body = JSON.stringify({History: data});
      context.logger.log('info', 'api response', response);
      context.cb(null, response);
    })
    .catch((err) => {
      context.logger.log('error', 'api error', err);
      context.cb(err);
    });
});
