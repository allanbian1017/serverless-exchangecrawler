'use strict';

/**
 * Constructor for CurrencyInfo object.
 *
 * @param {Object} options JSON configuration.
 * @param {Object} options.db AWS.DynamoDB.DocumentClient object.
 */
const CurrencyInfo = class {
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
        return Promise.resolve(data.Item);
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

module.exports = CurrencyInfo;
