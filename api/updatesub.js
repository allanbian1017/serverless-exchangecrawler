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
  context.logger.log('info', 'updatesub start', event);

  const body = JSON.parse(event.body);
  let response = {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };

  if (typeof body.action === 'undefined') {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: 'Bad Request',
    });
    return context.cb(null, response);
  }

  let plat = event.path.plat;
  let token = event.headers.Authorization;
  let action = body.action;
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

      if (action == 0) {
        return store.removeUser(context, plat, userID);
      }
      return store.addUser(context, plat, userID);
    })
    .then(() => {
      response.statusCode = 200;
      response.body = JSON.stringify({});
      context.cb(null, response);
    })
    .catch((err) => {
      context.logger.log('error', 'updatesub error', err);
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
