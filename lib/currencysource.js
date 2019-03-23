'use strict';

const moment = require('moment');

const CurrencySource = class {
  /**
   * Constructor for CurrencySource object.
   *
   * @param {Object} options JSON configuration.
   * @param {Object} options.client HttpClient object.
   */
  constructor(options) {
    this.client = options.client;
    this.url = 'http://rate.bot.com.tw/xrt/fltxt/0/day';
  }

  /**
   * @private
   *
   * @param {String} data Body payload.
   * @param {Arrays} types Currency type.
   * @return {Object}
   */
  parseCurrency(data, types) {
    let currency = {};
    let body = data;

    body
      .split('\n')
      .filter((x) => {
        for (let i = 0, len = types.length; i < len; i++) {
          if (x.startsWith(types[i])) return true;
        }
        return false;
      })
      .map((x) => {
        let item = x
          .split(' ')
          .filter((x) => {
            return x !== '';
          })
          .filter((x, idx) => {
            return idx === 0 || idx === 12;
          });

        currency[item[0]] = parseFloat(item[1]);
        return {};
      });

    return currency;
  }

  /**
   * @private
   *
   * @argument {String} data Body payload.
   * @return {Timestamp}
   */
  parseDate(data) {
    let date = data.substr(
      data.indexOf('@') + 1,
      data.indexOf('.') - data.indexOf('@') - 1
    );
    return moment(date, 'YYYYMMDDhhmm').valueOf();
  }

  /**
   * Query currency information.
   *
   * @param {Object} params JSON configuration.
   * @param {Array} params.types Currency type.
   * @return {Promise}
   */
  async query(params) {
    let self = this;
    let types = params.types;

    let resp = await self.client.get(self.url);
    let info = self.parseCurrency(resp.body, types);
    info.date = self.parseDate(resp.headers['content-disposition']);

    return info;
  }
};

module.exports = CurrencySource;
