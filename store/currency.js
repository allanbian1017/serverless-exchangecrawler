'use strict';

const moment = require('moment');
const Metrics = require('../base/metrics');
const NotFoundError = require('../base/error');
const metrics = new Metrics();

const Currency = class {
  /**
   * Constructor for Currency object.
   *
   * @param {Object} options JSON configuration.
   * @param {Object} options.kv KV object.
   * @param {Object} options.storage Storage object.
   * @param {Object} options.event Event object.
   * @param {String} options.currencyChangedTopic the topic arn
   *  which will publish event when currency changed.
   * @param {Object} options.client HttpClient object.
   */
  constructor(options) {
    this.kv = options.kv;
    this.storage = options.storage;
    this.event = options.event;
    this.currencyChangedTopic = options.currencyChangedTopic;
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
   * Query currency information from source.
   *
   * @param {String} bank Bank.
   * @param {Array} types Currency type.
   * @return {Promise}
   */
  async queryCurrency(bank, types) {
    metrics.count('exchange-crawler.Currency', 1, {
      func: 'queryCurrency',
    });

    // TODO support multiple currency source
    if (bank != 'BOT') {
      return {};
    }

    let resp = await this.client.get(this.url);
    let info = this.parseCurrency(resp.body, types);
    info.date = this.parseDate(resp.headers['content-disposition']);

    return info;
  }

  /**
   * Crawling Currency.
   *
   * @param {Array} types Currency types.
   * @return {Promise}
   */
  async crawlingCurrency(types) {
    metrics.count('exchange-crawler.Currency', 1, {
      func: 'crawlingCurrency',
    });

    let curRec = await this.queryCurrency('BOT', types);
    let cacheRec = await this.getCurrency('BOT');

    if (Object.keys(cacheRec).length) {
      if (new Date(curRec.date) > new Date(cacheRec.date)) {
        let dateStr = moment(curRec.date).format('YYYYMMDD');
        await this.addHistory('BOT', dateStr, curRec);
        await this.putCurrency('BOT', curRec);
        await this.event.publish(this.currencyChangedTopic, curRec);
        return {};
      }
    } else {
      let dateStr = moment(curRec.date).format('YYYYMMDD');
      await this.addHistory('BOT', dateStr, curRec);
      await this.putCurrency('BOT', curRec);
      await this.event.publish(this.currencyChangedTopic, curRec);
      return {};
    }

    return {};
  }

  /**
   * Get currency information from cache.
   *
   * @param {String} bank Bank.
   * @return {Promise}
   */
  async getCurrency(bank) {
    metrics.count('exchange-crawler.Currency', 1, {
      func: 'getCurrency',
    });

    let record = await this.kv.get('currency', bank);
    if (!Object.keys(record).length) {
      return {};
    } else {
      return record.data;
    }
  }

  /**
   * Put currency information from cache.
   *
   * @param {String} bank Bank.
   * @param {Object} data Currency data.
   * @return {Promise}
   */
  async putCurrency(bank, data) {
    metrics.count('exchange-crawler.Currency', 1, {
      func: 'putCurrency',
    });

    let obj = {
      data: data,
    };

    await this.kv.put('currency', bank, obj);
    return {};
  }

  /**
   * Get currency history.
   *
   * @param {String} bank Bank name.
   * @param {String} date Date.
   * @return {Promise}
   */
  async getHistory(bank, date) {
    metrics.count('exchange-crawler.Currency', 1, {
      func: 'getHistory',
    });

    try {
      let path = 'History/' + bank + '/' + date + '.json';
      let record = await this.storage.get('currencybucket', path);
      return record.History;
    } catch (err) {
      if (err instanceof NotFoundError) {
        return [];
      }

      return err;
    }
  }

  /**
   * Put currency history.
   *
   * @param {String} bank Bank name.
   * @param {String} date Date.
   * @param {Array} history Currency history.
   * @return {Promise}
   */
  async putHistory(bank, date, history) {
    metrics.count('exchange-crawler.Currency', 1, {
      func: 'putHistory',
    });

    let obj = {
      History: history,
    };

    let path = 'History/' + bank + '/' + date + '.json';
    await this.storage.put('currencybucket', path, obj);
    return {};
  }

  /**
   * Add currency history.
   *
   * @param {String} bank Bank name.
   * @param {String} date Date.
   * @param {Object} info Currency information.
   * @return {Promise}
   */
  async addHistory(bank, date, info) {
    metrics.count('exchange-crawler.Currency', 1, {
      func: 'addHistory',
    });

    // FIXME this is not atomic operation, it may cause racing issue
    let history = await this.getHistory(bank, date);
    history.push(info);

    await this.putHistory(bank, date, history);
    return {};
  }
};

module.exports = Currency;
