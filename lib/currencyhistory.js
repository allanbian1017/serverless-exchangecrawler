'use strict';

/**
 * Constructor for CurrencyHistory object.
 *
 * @param {Object} options JSON configuration.
 * @param {Object} options.db AWS.DynamoDB.DocumentClient object.
 */
const CurrencyHistory = class {
  constructor(options) {
    this.db = options.db;
  }

  /**
   * Get currency history information.
   *
   * @param {String} bank Bank.
   * @return {Promise}
   */
  get(bank) {
    let self = this;

    return new Promise(function(resolve, reject) {
      let params = {
        TableName: 'currency',
        Key: {
          bank: bank
        }
      };

      self.db.get(params, function(err, data) {
        if (err) return reject(err);

        resolve(data.Item);
      });
    });
  }

  /**
   * Put currency history information.
   *
   * @param {String} bank Bank.
   * @param {Object} data Currency data.
   * @return {Promise}
   */
  put(bank, data) {
    let self = this;

    return new Promise(function(resolve, reject) {
      let params = {
        TableName: 'currency',
        Item: {
          bank: bank,
          data: data
        }
      };

      self.db.put(params, function(err, data) {
        if (err) return reject(err);

        resolve();
      });
    });
  }
};

module.exports = CurrencyHistory;
