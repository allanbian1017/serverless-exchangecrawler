'use strict';

const moment = require('moment');

/**
 * Constructor for Currency object.
 *
 * @param {Object} options JSON configuration.
 * @param {Object} options.client HttpClient object.
 */
const Currency = class {
  constructor(options) {
    this.client = options.client;
    this.url = 'http://rate.bot.com.tw/xrt/fltxt/0/day';
  }

  /**
   * @api private
   */
  parseCurrency(data, types) {
    let currency = {};
    let body = data;

    body.split('\n').filter(function(x) {
        for (var i = 0, len = types.length; i < len; i++) {
          if (x.startsWith(types[i])) return true;
        }
        return false;
      })
      .map(function(x) {
        let item = x.split(' ').filter(function(x) {
          return x !== '';
        })
        .filter(function(x, idx) {
          return idx === 0 || idx === 12;
        });

        currency[item[0]] = parseFloat(item[1]);
        return {};
      });

    return currency;
  }

  /**
   * @api private
   */
  parseDate(data) {
    let date = data.substr(data.indexOf('@') + 1, data.indexOf('.') - data.indexOf('@') - 1);
    return moment(date, "YYYYMMDDhhmm").format();
  }

  /**
   * Query currency information.
   *
   * @param {Object} params JSON configuration.
   * @param {Array} params.types Currency type.
   * @return {Promise}
   */
  query(params) {
    let self = this;
    let types = params.types;

    return new Promise(function(resolve, reject) {
      self.client.get(self.url, function(err, data) {
        if (err) return reject(err);

        let info = self.parseCurrency(data.body, types);
        info.date = self.parseDate(data.headers['content-disposition']);

        resolve(info);
      });
    });
  }
};

module.exports = Currency;
