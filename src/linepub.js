'use strict';

const awsXRay = require('aws-xray-sdk');
const AWS = awsXRay.captureAWS(require('aws-sdk'));
const metrics = require('serverless-datadog-metrics');
const LineBot = require('../lib/linebot');
const BotUser = require('../lib/botuser');
const CrawlerService = require('./crawlerservice');
const line = require('@line/bot-sdk');

const s3 = new AWS.S3();
const botuser = new BotUser({storage: s3});
const client = new line.Client({
  channelAccessToken: process.env.LINE_ACCESSTOKEN,
  channelSecret: process.env.LINE_SECRET,
});
const bot = new LineBot({
  lineclient: client,
  botuser: botuser,
  metrics: metrics,
});
const service = new CrawlerService({bot: bot});

exports.main = (event, context, cb) => {
  console.log(event);

  Promise.resolve()
    .then(function() {
      let events = event.Records.map(function(x) {
        return x.Sns;
      });

      return service.publishEvents(events);
    })
    .then(function() {
      cb();
    })
    .catch(function(err) {
      console.log(err);

      cb(err);
    });
};
