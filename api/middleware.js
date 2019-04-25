'use strict';

const logger = require('../base/logger');
const Context = require('../base/context');
const Metrics = require('../base/metrics');
const metrics = new Metrics('api');

exports.handle = (handler) => {
  return (event, context, cb) => {
    metrics.count('request', 1, {});
    let lambdaEvent = {
      headers: event.headers,
      query: event.queryStringParameters,
      path: event.pathParameters,
      body: event.body,
      Records: event.Records,
    };

    let contextLogger = logger.child({requestID: context.awsRequestId});
    let handlerContext = new Context({
      event: lambdaEvent,
      cb: (err, obj) => {
        if (err) {
          metrics.count('error', 1, {});
          cb(err);
          return;
        }

        metrics.count('success', 1, {});
        cb(null, obj);
      },
      logger: contextLogger,
    });

    handler(handlerContext);
  };
};
