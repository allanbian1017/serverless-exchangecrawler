'use strict';

const metrics = require('datadog-metrics');

const Metrics = class {
  /**
   * Constructor for Metrics object.
   */
  constructor() {
    this.client = new metrics.BufferedMetricsLogger({
      apiKey: process.env.DATADOG_API_KEY,
    });
  }

  /**
   * Increment counter.
   *
   * @param {String} key Counter key.
   * @param {int} value Increment count.
   * @param {Object} tags Counter tags.
   * @return {Promise}
   */
  count(key, value, tags) {
    let self = this;

    return new Promise(function(resolve, reject) {
      let t = Object.keys(tags).map(function(key) {
        let val = tags[key];

        return key + ':' + val;
      });

      self.client.increment(key, value, t);
      self.client.flush(
        function() {
          resolve();
        },
        function(err) {
          reject(err);
        }
      );
    });
  }
};

module.exports = Metrics;
