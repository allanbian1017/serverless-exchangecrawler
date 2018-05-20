'use strict';

const awsXRay = require('aws-xray-sdk');
const AWS = awsXRay.captureAWS(require('aws-sdk'));
const winston = require('winston');
const LogzIO = require('winston-logzio');
const Metrics = require('../lib/metrics');
const LineBot = require('../lib/linebot');
const BotUser = require('../lib/botuser');
const CrawlerService = require('./crawlerservice');
const line = require('@line/bot-sdk');

const logZIOTransport = new LogzIO({
  token: process.env.LOGZIO_TOKEN,
});
const logger = new winston.Logger({
  transports: [new winston.transports.Console(), logZIOTransport],
});
const s3 = new AWS.S3();
const botuser = new BotUser({storage: s3});
const client = new line.Client({
  channelAccessToken: process.env.LINE_ACCESSTOKEN,
  channelSecret: process.env.LINE_SECRET,
});
const bot = new LineBot({
  lineclient: client,
  botuser: botuser,
});
const metrics = new Metrics(process.env.DATADOG_API_KEY);
const service = new CrawlerService({
  bot: bot,
  metrics: metrics,
});

exports.main = (event, context, cb) => {
  logger.log('info', 'api request', event);

  Promise.resolve()
    .then(function() {
      let events = event.Records.map(function(x) {
        return x.Sns;
      });

      return service.publishEvents(events);
    })
    .then(function() {
      logZIOTransport.flush();
      cb();
    })
    .catch(function(err) {
      logger.log('error', 'api error', err);
      logZIOTransport.flush();
      cb(err);
    });
};
