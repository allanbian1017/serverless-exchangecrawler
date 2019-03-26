'use strict';

const moment = require('moment');
const logger = require('../base/logger');
const Storage = require('../base/storage');
const Currency = require('../store/currency');

const storage = new Storage();
const store = new Currency({
  storage: storage,
});

exports.main = (event, context, cb) => {
  logger.log('info', 'api request', event);

  let response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };

  Promise.resolve()
    .then(() => {
      let bank = 'BOT';
      let date = event.pathParameters.date;
      return store.getHistory(bank, date);
    })
    .then((data) => {
      if (moment().format('YYYYMMDD') !== event.pathParameters.date) {
        response.headers['cache-control'] = 'public, max-age=31536000';
      } else {
        response.headers['cache-control'] = 'public, max-age=1800';
      }

      response.body = JSON.stringify({History: data});
      logger.log('info', 'api response', response);
      cb(null, response);
    })
    .catch((err) => {
      logger.log('error', 'api error', err);
      cb(err);
    });
};
