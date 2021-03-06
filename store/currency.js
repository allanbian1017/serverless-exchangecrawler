'use strict';

const moment = require('moment-timezone');
const Metrics = require('../base/metrics');
const NotFoundError = require('../error/notfounderror');
const metrics = new Metrics('currency');

const Currency = class {
  /**
   * Constructor for Currency object.
   *
   * @param {Object} options JSON configuration.
   * @param {Object} options.kv KV object.
   * @param {Object} options.storage Storage object.
   * @param {String} options.currencyChangedTopic the topic arn
   *  which will publish event when currency changed.
   * @param {Object} options.client HttpClient object.
   */
  constructor(options) {
    this.kv = options.kv;
    this.storage = options.storage;
    this.currencyChangedTopic = options.currencyChangedTopic;
    this.client = options.client;
    this.url = 'https://rate.bot.com.tw/xrt/fltxt/0/day';
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
    return moment.tz(date, 'YYYYMMDDhhmm', 'Asia/Taipei').valueOf();
  }

  /**
   * Query currency information from source.
   *
   * @param {Context} context context.
   * @param {String} bank Bank.
   * @param {Array} types Currency type.
   * @return {Promise}
   */
  async queryCurrency(context, bank, types) {
    metrics.count('exec', 1, {
      func: 'queryCurrency',
    });

    // TODO support multiple currency source
    if (bank != 'BOT') {
      context.logger.log('error', 'unsupport bank', {bank: bank});
      return {};
    }

    let resp = await this.client.get(context, this.url);
    context.logger.log('debug', 'queryCurrency response', {resp: resp});

    let info = this.parseCurrency(resp.body, types);
    info.date = this.parseDate(resp.headers['content-disposition']);

    return info;
  }

  /**
   * Parse Currency object from DynamoDB Stream record.
   *
   * DynamoDB Stream record:
   * {
   *  "bank": {
   *    "S": "BOT"
   *  },
   *  "data": {
   *    "M": {
   *      "date": {
   *        "N": "1553788800000"
   *      },
   *      "USD": {
   *        "N": "31.115"
   *      }
   *    }
   *  }
   * }
   *
   * Returned Currency object example:
   * {
   *   "USD":31.13,
   *   "HKD":3.983,
   *   "GBP":41.22,
   *   "AUD":22.39,
   *   "JPY":0.2797,
   *   "EUR":35.33,
   *   "KRW":0.0292,
   *   "CNY":4.65,
   *   "date":1555031100000,
   * },
   *
   * @param {Context} context context.
   * @param {Object} record DynamoDB Stream record.
   * @return {Object}
   */
  parseCurrencyFromDynamoDBStream(context, record) {
    context.logger.log('debug', 'parse record', record);
    if (!record.data || !record.data.M) {
      return {};
    }

    let obj = record.data.M;
    let currencyObj = {
      Bank: record.bank.S,
    };
    Object.keys(obj).forEach((x) => {
      if (obj[x].N) {
        if (x == 'date') {
          currencyObj[x] = parseInt(obj[x].N, 10);
        } else {
          currencyObj[x] = parseFloat(obj[x].N);
        }
      }
    });

    return currencyObj;
  }

  /**
   * Crawling Currency.
   *
   * @param {Context} context context.
   * @param {Array} types Currency types.
   * @return {Promise}
   */
  async crawlingCurrency(context, types) {
    metrics.count('exec', 1, {
      func: 'crawlingCurrency',
    });

    let currency = await this.queryCurrency(context, 'BOT', types);
    await this.putCurrency(context, 'BOT', currency);
    return {};
  }

  /**
   * Get currency information from cache.
   *
   * @param {Context} context context.
   * @param {String} bank Bank.
   * @return {Promise}
   */
  async getCurrency(context, bank) {
    metrics.count('exec', 1, {
      func: 'getCurrency',
    });

    let record = await this.kv.get(context, 'currency', bank);
    if (!Object.keys(record).length) {
      return {};
    } else {
      return record.data;
    }
  }

  /**
   * Put currency information from cache.
   *
   * @param {Context} context context.
   * @param {String} bank Bank.
   * @param {Object} data Currency data.
   * @return {Promise}
   */
  async putCurrency(context, bank, data) {
    metrics.count('exec', 1, {
      func: 'putCurrency',
    });

    let obj = {
      data: data,
    };

    await this.kv.put(context, 'currency', bank, obj);
    return {};
  }

  /**
   * Get currency history.
   *
   * @param {Context} context context.
   * @param {String} bank Bank name.
   * @param {String} date Date.
   * @return {Promise}
   */
  async getHistory(context, bank, date) {
    metrics.count('exec', 1, {
      func: 'getHistory',
    });

    try {
      let path = 'History/' + bank + '/' + date + '.json';
      let record = await this.storage.get(context, 'currencybucket', path);
      return record.History;
    } catch (err) {
      context.logger.log('error', 'getHistory error', {err: err});
      if (err instanceof NotFoundError) {
        return [];
      }

      return err;
    }
  }

  /**
   * Put currency history.
   *
   * @param {Context} context context.
   * @param {String} bank Bank name.
   * @param {String} date Date.
   * @param {Array} history Currency history.
   * @return {Promise}
   */
  async putHistory(context, bank, date, history) {
    metrics.count('exec', 1, {
      func: 'putHistory',
    });

    let obj = {
      History: history,
    };

    let path = 'History/' + bank + '/' + date + '.json';
    await this.storage.put(context, 'currencybucket', path, obj);
    return {};
  }

  /**
   * Add currency history.
   *
   * @param {Context} context context.
   * @param {String} bank Bank name.
   * @param {String} date Date.
   * @param {Object} info Currency information.
   * @return {Promise}
   */
  async addHistory(context, bank, date, info) {
    metrics.count('exec', 1, {
      func: 'addHistory',
    });

    // FIXME this is not atomic operation, it may cause racing issue
    let history = await this.getHistory(context, bank, date);
    history.push(info);

    await this.putHistory(context, bank, date, history);
    return {};
  }
};

module.exports = Currency;
