'use strict';

const awsXRay = require('aws-xray-sdk');
const AWS = awsXRay.captureAWS(require('aws-sdk'));
const moment = require('moment');
const winston = require('winston');
const LogzIO = require('winston-logzio');
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
const service = new CrawlerService({
  history: history,
});

const {graphql, buildSchema} = require('graphql');

const schema = buildSchema(`
  enum Currency {
      JP
      US
      CN
  }

  type History {
    Rate: Int!
    Date: Int!
  }
  
  type Query {
    history(Country: Currency! , Date: Int!): History!
  }
`);

const resolvers = {
  history: (args) => service.fetchHistoryByCurrency(args.Date, args.Country),
};

module.exports.query = async (event) => {
  console.log(event);
  const result = await graphql(schema, event.body, resolvers);
  return {statusCode: 200, body: JSON.stringify(result.data, null, 2)};
};
