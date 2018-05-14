'use strict';

const awsXRay = require('aws-xray-sdk');
const AWS = awsXRay.captureAWS(require('aws-sdk'));
const CurrencyCache = require('../lib/currencycache');
const CrawlerService = require('./crawlerservice');
const BotUser = require('../lib/botuser');

const s3 = new AWS.S3();
const botuser = new BotUser({storage: s3});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const cache = new CurrencyCache({db: dynamodb});
const service = new CrawlerService({
  cache: cache,
  botuser: botuser,
});

exports.main = (event, context, cb) => {
  console.log(event);

  const body = JSON.parse(event.body);
  let response = {};

  if (!body.result || !body.result.action) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: 'Bad Request',
    });
    return cb(null, response);
  }

  Promise.resolve()
    .then(function() {
      if (body.result.action === 'query.currency') {
        if (!body.result.parameters || !body.result.parameters.CurrencyType) {
          response.statusCode = 400;
          response.body = JSON.stringify({
            message: 'Bad Request',
          });
          return cb(null, response);
        }

        return service.queryCurrency([body.result.parameters.CurrencyType]);
      } else if (body.result.action === 'query.currency.all') {
        return service.queryCurrency([
          'USD',
          'JPY',
          'AUD',
          'CNY',
          'KRW',
          'EUR',
          'GBP',
          'HKD',
        ]);
      } else if (body.result.action === 'subscription.subscribe') {
        let plat = body.originalRequest.source;
        let userId = body.originalRequest.data.source.userId;
        return service.addSubscribeUser(plat, userId);
      } else if (body.result.action === 'subscription.subscribe') {
        let plat = body.originalRequest.source;
        let userId = body.originalRequest.data.source.userId;
        return service.delSubscribeUser(plat, userId);
      } else {
        return Promise.resolve({text: '我不懂'});
      }
    })
    .then(function(data) {
      response.statusCode = 200;
      response.body = JSON.stringify({
        speech: data.text,
        displayText: data.text,
      });
      cb(null, response);
    })
    .catch(function(err) {
      console.log(err);

      cb(err);
    });
};
