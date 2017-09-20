'use strict';

const AWS = require('aws-sdk');
const HttpClient = require('../lib/httpclient');
const CurrencyInfo = require('../lib/currencyinfo');
const CurrencyBot = require('../lib/currencybot');
const BotUser = require('../lib/botuser');
const Config = require('../lib/config');
const CrawlerService = require('./crawlerservice');
const line = require('@line/bot-sdk');

exports.main = (event, context, cb) => {
  console.log(event);

  const s3 = new AWS.S3();
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const info = new CurrencyInfo({ db: dynamodb });
  const config = Config.get(process.env.AWS_REGION);
  const client = new line.Client(config.line_config);
  const botuser = new BotUser({ storage: s3 });
  const bot = new CurrencyBot({ lineclient: client, botuser: botuser });
  const service = new CrawlerService({ bot: bot, info: info });
  const body = JSON.parse(event.body);
  let response = {};

  if (!line.validateSignature(new Buffer(event.body, 'utf-8'), config.line_config.channelSecret, event.headers['X-Line-Signature'])) {
    console.log('HMAC Error');
    response.statusCode = 403;
    response.body = JSON.stringify({
      message: 'Forbidden'
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
