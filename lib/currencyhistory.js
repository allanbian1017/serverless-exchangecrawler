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
  get(bank, date) {
    let self = this;

    return Promise.resolve()
      .then(function() {
        let params = {
          Bucket: self.bucket,
          Key: 'History/' + bank + '/' + date + '.json',
        };

        return self.storage.headObject(params).promise();
      })
      .then(function() {
        let params = {
          Bucket: self.bucket,
          Key: 'History/' + bank + '/' + date + '.json',
        };

        return self.storage.getObject(params).promise();
      })
      .then(function(data) {
        let payload = JSON.parse(new Buffer(data.Body).toString('ascii'));
        return Promise.resolve(payload.History);
      })
      .catch(function(err) {
        if (err.code === 'Forbidden') {
          return Promise.resolve([]);
        }

        return Promise.reject(err);
      });
  }

  /**
   * Put currency history.
   *
   * @param {String} bank Bank name.
   * @param {String} date Date.
   * @param {Array} history Currency history.
   * @return {Promise}
   */
  put(bank, date, history) {
    let self = this;

    return Promise.resolve()
      .then(function() {
        let params = {
          Bucket: self.bucket,
          Key: 'History/' + bank + '/' + date + '.json',
          Body: JSON.stringify({
            History: history,
          }),
        };

        return self.storage.putObject(params).promise();
      });
  }

  /**
   * Add currency history.
   *
   * @param {String} bank Bank name.
   * @param {String} date Date.
   * @param {Object} info Currency information.
   * @return {Promise}
   */
  add(bank, date, info) {
    let self = this;

    return Promise.resolve()
      .then(function() {
        return self.get(bank, date);
      })
      .then(function(data) {
        data.push(info);
        return self.put(bank, date, data);
      });
  }
};

module.exports = CurrencyHistory;
