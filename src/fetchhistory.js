'use strict';

const AWS = require('aws-sdk');
const CurrencyHistory = require('../lib/currencyhistory');
const Config = require('../lib/config');
const CrawlerService = require('./crawlerservice');

exports.main = (event, context, cb) => {
  console.log(event);

  const s3 = new AWS.S3();
  const history = new CurrencyHistory({ storage: s3 });
  const config = Config.get(process.env.AWS_REGION);
  const service = new CrawlerService({ history: history });
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
      response.body = JSON.stringify({ History: data });
      cb(null, response);
    })
    .catch(function(err) {
      console.log(err);

      cb(err);
    });
};

