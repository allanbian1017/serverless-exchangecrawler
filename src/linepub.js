'use strict';

const awsXRay = require('aws-xray-sdk');
const AWS = awsXRay.captureAWS(require('aws-sdk'));
const CurrencyBot = require('../lib/currencybot');
const BotUser = require('../lib/botuser');
const CrawlerService = require('./crawlerservice');
const line = require('@line/bot-sdk');

exports.main = (event, context, cb) => {
  console.log(event);

  const s3 = new AWS.S3();
  const client = new line.Client({ channelAccessToken: process.env.LINE_ACCESSTOKEN, channelSecret: process.env.LINE_SECRET });
  const botuser = new BotUser({ storage: s3 });
  const bot = new CurrencyBot({ lineclient: client, botuser: botuser });
  const service = new CrawlerService({ bot: bot });

  Promise.resolve()
    .then(function() {
      let events = event.Records.map(function(x) {
          return x.Sns;
        });

      return service.processLinePublishEvents(events);
    })
    .then(function() {
      cb();
    })
    .catch(function(err) {
      console.log(err);

      cb(err);
    });
};

