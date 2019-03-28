'use strict';

const awsXRay = require('aws-xray-sdk');
const AWS = awsXRay.captureAWS(require('aws-sdk'));
const sns = new AWS.SNS();

const Event = class {
  /**
   * Constructor for Event object.
   *
   */
  constructor() {}

  /**
   * Publish a event with message.
   *   currently we only support to publish json object
   *
   * @param {Context} context context.
   * @param {String} topic topic arn.
   * @param {Object} msg msg to publish.
   * @return {Promise}
   */
  async publish(context, topic, msg) {
    let params = {
      TopicArn: topic,
      Message: JSON.stringify(msg),
    };

    await sns.publish(params).promise();
    return {};
  }
};

module.exports = Event;
