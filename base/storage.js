'use strict';

const awsXRay = require('aws-xray-sdk');
const AWS = awsXRay.captureAWS(require('aws-sdk'));
const NotFoundError = require('./error');
const s3 = new AWS.S3();

const Storage = class {
  /**
   * Constructor for Storage object.
   *
   */
  constructor() {}

  /**
   * Get from storage.
   *   currently we only support json object
   *
   * @param {Context} context context.
   * @param {String} bucket bucket name.
   * @param {String} path file path.
   * @return {Promise}
   */
  async get(context, bucket, path) {
    let params = {
      Bucket: bucket,
      Key: path,
    };

    try {
      await s3.headObject(params).promise();
      let records = await s3.getObject(params).promise();
      let payload = JSON.parse(new Buffer(records.Body).toString('ascii'));
      return payload;
    } catch (err) {
      if (err.code === 'Forbidden') {
        return Promise.reject(new NotFoundError('file not found'));
      }

      return Promise.reject(err);
    }
  }

  /**
   * Put to storage.
   *   currently we only support storing json object
   *
   * @param {Context} context context.
   * @param {String} bucket bucket name.
   * @param {String} path file path.
   * @param {Object} data data to store.
   * @return {Promise}
   */
  async put(context, bucket, path, data) {
    let params = {
      Bucket: bucket,
      Key: path,
      Body: JSON.stringify(data),
    };

    await s3.putObject(params).promise();
    return {};
  }
};

module.exports = Storage;
