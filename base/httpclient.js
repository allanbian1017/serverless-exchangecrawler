'use strict';

const request = require('request');

const HttpClient = class {
  /**
   * Generate http get request.
   *
   * @param {Context} context context.
   * @param {String} url Url.
   * @param {Object} headers request headers.
   * @return {Promise}
   */
  get(context, url, headers) {
    return new Promise((resolve, reject) => {
      request({url: url, headers: headers}, (err, data) => {
        if (err) return reject(err);

        resolve(data);
      });
    });
  }
};

module.exports = HttpClient;
