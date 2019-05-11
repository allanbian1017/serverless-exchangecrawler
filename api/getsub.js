'use strict';

const Middleware = require('./middleware');
const Storage = require('../base/storage');
const Bot = require('../base/bot');
const Subscription = require('../store/subscription');
const AuthError = require('../error/autherror');

const storage = new Storage();
const bot = new Bot();
const store = new Subscription({
  storage: storage,
});

exports.main = Middleware.handle((context) => {
  let event = context.event;
  context.logger.log('info', 'getsub start', event);

  let plat = event.path.plat;
  let token = event.headers.Authorization;
  let response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };
  Promise.resolve()
    .then(() => {
      return bot.getUserID(context, plat, token);
    })
    .then((userID) => {
      context.logger.log('info', 'userID', {
        userID: userID,
      });

      if (!userID) {
        throw new AuthError('unauthroized user');
      }

      return store.isUserInSubsctipion(context, plat, userID);
    })
    .then((exist) => {
      context.logger.log('info', 'status', {
        status: exist,
      });

      response.body = JSON.stringify({status: exist});
      context.cb(null, response);
    })
    .catch((err) => {
      context.logger.log('error', 'getsub error', err);
      if (err instanceof AuthError) {
        response.statusCode = 403;
        response.body = JSON.stringify({
          message: 'Forbidden',
        });
        return context.cb(null, response);
      }

      context.cb(err);
    });
});
