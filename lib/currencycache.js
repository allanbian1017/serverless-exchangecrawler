'use strict';

const CurrencyCache = class {
  /**
   * Constructor for CurrencyCache object.
   *
   * @param {Object} options JSON configuration.
   * @param {Object} options.db AWS.DynamoDB.DocumentClient object.
   */
  constructor(options) {
    this.db = options.db;
  }

  /**
   * Get currency information cache.
   *
   * @param {String} bank Bank.
   * @return {Promise}
   */
  async get(bank) {
    let self = this;

    let params = {
      TableName: 'currency',
      Key: {
        bank: bank,
      },
    };

    let record = await self.db.get(params).promise();
    if (!Object.keys(record).length) {
      return {};
    } else {
      return record.Item;
    }
  }

  /**
   * Put currency information cache.
   *
   * @param {String} bank Bank.
   * @param {Object} data Currency data.
   * @return {Promise}
   */
  async put(bank, data) {
    let self = this;

    let params = {
      TableName: 'currency',
      Item: {
        bank: bank,
        data: data,
      },
    };

    await self.db.put(params).promise();
    return {};
  }
};

module.exports = CurrencyCache;
