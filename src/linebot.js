'use strict';

const awsXRay = require('aws-xray-sdk');
const AWS = awsXRay.captureAWS(require('aws-sdk'));
const CurrencyCache = require('../lib/currencycache');
const CurrencyBot = require('../lib/currencybot');
const BotUser = require('../lib/botuser');
const CrawlerService = require('./crawlerservice');
const line = require('@line/bot-sdk');

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const cache = new CurrencyCache({db: dynamodb});
const botuser = new BotUser({storage: s3});
const client = new line.Client({
  channelAccessToken: process.env.LINE_ACCESSTOKEN,
  channelSecret: process.env.LINE_SECRET}
);
const bot = new CurrencyBot({
  lineclient: client,
  botuser: botuser,
});
const service = new CrawlerService({
  bot: bot,
  cache: cache,
});

exports.main = (event, context, cb) => {
  console.log(event);

  const body = JSON.parse(event.body);
  let response = {};

  if (!line.validateSignature(
    new Buffer(event.body, 'utf-8'),
    process.env.LINE_SECRET,
    event.headers['X-Line-Signature']
  )) {
    console.log('HMAC Error');
    response.statusCode = 403;
    response.body = JSON.stringify({
      message: 'Forbidden',
    });
    return cb(null, response);
  }

  Promise.resolve()
    .then(function() {
      return service.processLineEvents(body);
    })
    .then(function(data) {
      response.statusCode = 200;
      cb(null, response);
    })
    .catch(function(err) {
      console.log(err);

      cb(err);
    });
};
