'use strict';

const awsXRay = require('aws-xray-sdk');
const AWS = awsXRay.captureAWS(require('aws-sdk'));
const moment = require('moment');
const CurrencyHistory = require('../lib/currencyhistory');
const CrawlerService = require('./crawlerservice');

const s3 = new AWS.S3();
const history = new CurrencyHistory({ storage: s3 });
const service = new CrawlerService({ history: history });

exports.main = (event, context, cb) => {
  console.log(event);

  let response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin' : '*'
    }
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

      response.body = JSON.stringify({ History: data });
      cb(null, response);
    })
    .catch(function(err) {
      console.log(err);

      cb(err);
    });
};

