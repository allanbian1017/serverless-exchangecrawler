'use strict';

const metrics = require('datadog-metrics');

const Metrics = class {
  /**
   * Constructor for Metrics object.
   *
   * @param {String} moduleName module name.
   */
  constructor(moduleName) {
    let apiKey = process.env.DATADOG_API_KEY;
    if (!apiKey) {
      apiKey = 'dummy';
    }

    this.moduleName = moduleName;
    this.client = new metrics.BufferedMetricsLogger({
      apiKey: apiKey,
      flushIntervalSeconds: 1,
    });
  }

  /**
   * Increment counter.
   *
   * @param {String} key Counter key.
   * @param {int} value Increment count.
   * @param {Object} tags Counter tags.
   */
  count(key, value, tags) {
    let t = Object.keys(tags).map((k) => {
      let val = tags[k];

      return k + ':' + val;
    });

    let ddKey = this.moduleName + '.' + key;
    this.client.increment(ddKey, value, t);
    this.client.flush();
  }
};

module.exports = Metrics;
