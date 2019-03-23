'use strict';

const CurrencyHistory = class {
  /**
   * Constructor for CurrencyHistory object.
   *
   * @param {Object} options JSON configuration.
   * @param {Object} options.storage AWS.S3 object.
   */
  constructor(options) {
    this.storage = options.storage;
    this.bucket = 'currencybucket';
  }

  /**
   * Get currency history.
   *
   * @param {String} bank Bank name.
   * @param {String} date Date.
   * @return {Promise}
   */
  async get(bank, date) {
    let self = this;

    let params = {
      Bucket: self.bucket,
      Key: 'History/' + bank + '/' + date + '.json',
    };

    try {
      await self.storage.headObject(params).promise();
      let records = await self.storage.getObject(params).promise();
      let payload = JSON.parse(new Buffer(records.Body).toString('ascii'));
      return payload.History;
    } catch (err) {
      if (err.code === 'Forbidden') {
        return [];
      }

      return Promise.reject(err);
    }
  }

  /**
   * Put currency history.
   *
   * @param {String} bank Bank name.
   * @param {String} date Date.
   * @param {Array} history Currency history.
   * @return {Promise}
   */
  async put(bank, date, history) {
    let self = this;

    let params = {
      Bucket: self.bucket,
      Key: 'History/' + bank + '/' + date + '.json',
      Body: JSON.stringify({
        History: history,
      }),
    };

    await self.storage.putObject(params).promise();
    return {};
  }

  /**
   * Add currency history.
   *
   * @param {String} bank Bank name.
   * @param {String} date Date.
   * @param {Object} info Currency information.
   * @return {Promise}
   */
  async add(bank, date, info) {
    let self = this;

    let records = await self.get(bank, date);
    records.push(info);
    await self.put(bank, date, records);
    return {};
  }
};

module.exports = CurrencyHistory;
