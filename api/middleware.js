'use strict';

const logger = require('../base/logger');
const Context = require('../base/context');

exports.handle = (handler) => {
  return (event, context, cb) => {
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
      cb: cb,
      logger: contextLogger,
    });

    handler(handlerContext);
  };
};
