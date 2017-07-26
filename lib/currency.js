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

        let info = {};
        let body = data.body;
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

            info[item[0]] = parseFloat(item[1]);
            return {};
          });

        let hdr = data.headers['content-disposition'];
        let date = hdr.substr(hdr.indexOf('@') + 1, hdr.indexOf('.') - hdr.indexOf('@') - 1);
        info.date = moment(date, "YYYYMMDDhhmm").format();
        resolve(info);
      });
    });
  }
};

module.exports = Currency;
