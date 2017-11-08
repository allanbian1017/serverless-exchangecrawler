'use strict';

/**
 * Constructor for CurrencyCache object.
 *
 * @param {Object} options JSON configuration.
 * @param {Object} options.db AWS.DynamoDB.DocumentClient object.
 */
const CurrencyCache = class {
  constructor(options) {
    this.db = options.db;
  }

  /**
   * Get currency information cache.
   *
   * @param {String} bank Bank.
   * @return {Promise}
   */
  get(bank) {
    let self = this;

    return Promise.resolve()
      .then(function() {
        let params = {
          TableName: 'currency',
          Key: {
            bank: bank
          }
        };

        return self.db.get(params).promise();
      })
      .then(function(data) {
        if (!Object.keys(data).length) {
          return Promise.resolve({});
        } else {
          return Promise.resolve(data.Item);
        }
      });
  }

  /**
   * Put currency information cache.
   *
   * @param {String} bank Bank.
   * @param {Object} data Currency data.
   * @return {Promise}
   */
  put(bank, data) {
    let self = this;

    return Promise.resolve()
      .then(function() {
        let params = {
          TableName: 'currency',
          Item: {
            bank: bank,
            data: data
          }
        };

        return self.db.put(params).promise();
      });
  }
};

module.exports = CurrencyCache;
