'use strict';

const awsXRay = require('aws-xray-sdk');
const AWS = awsXRay.captureAWS(require('aws-sdk'));
const moment = require('moment');
const winston = require('winston');
const LogzIO = require('winston-logzio');
const Metrics = require('../lib/metrics');
const CurrencyHistory = require('../lib/currencyhistory');
const CrawlerService = require('./crawlerservice');

const logZIOTransport = new LogzIO({
  token: process.env.LOGZIO_TOKEN,
});
const logger = new winston.Logger({
  transports: [new winston.transports.Console(), logZIOTransport],
});
const s3 = new AWS.S3();
const history = new CurrencyHistory({storage: s3});
const metrics = new Metrics(process.env.DATADOG_API_KEY);
const service = new CrawlerService({
  history: history,
  metrics: metrics,
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
    .then(function() {
      return service.fetchHistory(event.pathParameters.date);
    })
    .then(function(data) {
      if (moment().format('YYYYMMDD') !== event.pathParameters.date) {
        response.headers['cache-control'] = 'public, max-age=31536000';
      } else {
        response.headers['cache-control'] = 'public, max-age=1800';
      }

      response.body = JSON.stringify({History: data});
      logger.log('info', 'api response', response);
      logZIOTransport.flush();
      cb(null, response);
    })
    .catch(function(err) {
      logger.log('error', 'api error', err);
      logZIOTransport.flush();
      cb(err);
    });
};
