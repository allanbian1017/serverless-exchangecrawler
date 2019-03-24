'use strict';

const awsXRay = require('aws-xray-sdk');
const AWS = awsXRay.captureAWS(require('aws-sdk'));
const dynamodb = new AWS.DynamoDB.DocumentClient();

const KV = class {
  /**
   * Constructor for KV object.
   *
   */
  constructor() {
    this.tableKeySetting = {
      currency: 'bank',
    };
  }

  /**
   * Get from database.
   *
   * @param {String} table table name.
   * @param {String} key key name.
   * @return {Promise}
   */
  async get(table, key) {
    let params = {
      TableName: table,
      Key: {},
    };

    // TODO currently we only support partition key only table
    //   we need to support partition key + sort key table
    let keyName = this.tableKeySetting[table];
    params.Key[keyName] = key;

    let record = await dynamodb.get(params).promise();
    if (!Object.keys(record).length) {
      return {};
    } else {
      return record.Item;
    }
  }

  /**
   * Put to database.
   *
   * @param {String} table table name.
   * @param {String} key key name.
   * @param {Object} value object to store.
   * @return {Promise}
   */
  async put(table, key, value) {
    let params = {
      TableName: 'currency',
      Item: value,
    };

    // TODO currently we only support partition key only table
    //   we need to support partition key + sort key table
    let keyName = this.tableKeySetting[table];
    params.Item[keyName] = key;

    await dynamodb.put(params).promise();
    return {};
  }
};

module.exports = KV;
