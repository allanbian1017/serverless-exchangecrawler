'use strict';

const request = require('request');

const HttpClient = class {
  /**
   * Generate http get request.
   *
   * @param {String} url Url.
   * @return {Promise}
   */
  get(url) {
    return new Promise((resolve, reject) => {
      request({url: url}, (err, data) => {
        if (err) return reject(err);

        resolve(data);
      });
    });
  }
};

module.exports = HttpClient;
