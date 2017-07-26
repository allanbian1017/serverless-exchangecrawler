'use strict';

const request = require('request');

/**
 * Constructor for HttpClient object.
 */
const HttpClient = class {

  /**
   * Generate http get request.
   *
   * @param {String} url Url.
   * @param {Function} cb Callback function
   */
  get(url, cb) {
    request({ url: url }, function(err, data) {
      if (err) return cb(err);

      cb(null, data);
    });   
  }
};

module.exports = HttpClient;
