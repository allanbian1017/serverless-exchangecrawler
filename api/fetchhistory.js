'use strict';

const Middleware = require('./middleware');
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
      'cache-control': 'public, max-age=1800',
    },
  };

  Promise.resolve()
    .then(() => {
      let bank = 'BOT';
      let date = event.path.date;
      return store.getHistory(context, bank, date);
    })
    .then((data) => {
      response.body = JSON.stringify({History: data});
      context.logger.log('info', 'api response', response);
      context.cb(null, response);
    })
    .catch((err) => {
      context.logger.log('error', 'api error', err);
      context.cb(err);
    });
});
