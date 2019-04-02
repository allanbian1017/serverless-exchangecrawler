'use strict';

const moment = require('moment');
const Metrics = require('../base/metrics');
const NotFoundError = require('../base/error');
const metrics = new Metrics();

const CrawlerBot = class {
  /**
   * Constructor for CrawlerBot object.
   *
   * @param {Object} options JSON configuration.
   * @param {Object} options.storage Storage object.
   * @param {Object} options.currency Currency object.
   * @param {Object} options.bot Bot object.
   */
  constructor(options) {
    this.storage = options.storage;
    this.currency = options.currency;
    this.bot = options.bot;
  }

  /**
   * Get bot users.
   *
   * @param {Context} context context.
   * @param {String} plat Bot platform.
   * @return {Promise}
   */
  async getUsers(context, plat) {
    metrics.count('exchange-crawler.CrawlerBot', 1, {
      func: 'getUsers',
    });

    try {
      let path = 'Users/' + plat + '.json';
      let record = await this.storage.get(context, 'currencybucket', path);
      return record.Users;
    } catch (err) {
      context.logger.log('error', 'getUsers error', {err: err});
      if (err instanceof NotFoundError) {
        return {};
      }

      return err;
    }
  }

  /**
   * Put bot users.
   *
   * @param {Context} context context.
   * @param {String} plat Bot platform.
   * @param {Object} users Bot users.
   * @return {Promise}
   */
  async putUsers(context, plat, users) {
    metrics.count('exchange-crawler.CrawlerBot', 1, {
      func: 'putUsers',
    });

    let obj = {
      Users: users,
    };

    let path = 'Users/' + plat + '.json';
    await this.storage.put(context, 'currencybucket', path, obj);
    return {};
  }

  /**
   * Add bot user.
   *
   * @param {Context} context context.
   * @param {String} plat Bot platform.
   * @param {Object} user Bot user.
   * @return {Promise}
   */
  async addSubscribeUser(context, plat, user) {
    metrics.count('exchange-crawler.CrawlerBot', 1, {
      func: 'addSubscribeUser',
    });

    // FIXME this is not atomic operation, it may cause racing issue
    let users = await this.getUsers(context, plat);
    users.push(user);
    await this.putUsers(context, plat, users);
    return {text: '訂閱成功'};
  }

  /**
   * Delete bot user.
   *
   * @param {Context} context context.
   * @param {String} plat Bot platform.
   * @param {Object} user Bot user.
   * @return {Promise}
   */
  async delSubscribeUser(context, plat, user) {
    metrics.count('exchange-crawler.CrawlerBot', 1, {
      func: 'delSubscribeUser',
    });

    // FIXME this is not atomic operation, it may cause racing issue
    let users = await this.getUsers(context, plat);
    let idx = users.indexOf(user);
    if (idx !== -1) {
      users.splice(idx, 1);
    }

    await this.putUsers(context, plat, users);
    return {text: '取消訂閱成功'};
  }

  /**
   * Broadcase currency information to all users to assigned bot platform.
   *
   * @param {Context} context context.
   * @param {String} plat Bot platform.
   * @param {Object} currency currency object to broadcast.
   * @return {Promise}
   */
  async broadcastCurrency(context, plat, currency) {
    metrics.count('exchange-crawler.CrawlerBot', 1, {
      func: 'broadcastCurrency',
    });

    context.logger.log('debug', 'broadcase currency', currency);
    let msg = this.getCurrencyMsg(currency);
    let users = await this.getUsers(context, plat);
    await this.bot.publish(context, plat, users, msg);
    return {};
  }

  /**
   * @private
   *
   * @argument {Object} data Currency data.
   * @return {String}
   */
  getCurrencyMsg(data) {
    let msg = '您好\n';

    if (data.USD) msg += '美金匯率' + data.USD + '\n';
    if (data.JPY) msg += '日元匯率' + data.JPY + '\n';
    if (data.AUD) msg += '澳幣匯率' + data.AUD + '\n';
    if (data.CNY) msg += '人民幣匯率' + data.CNY + '\n';
    if (data.KRW) msg += '韓元匯率' + data.KRW + '\n';
    if (data.EUR) msg += '歐元匯率' + data.EUR + '\n';
    if (data.GBP) msg += '英鎊匯率' + data.GBP + '\n';
    if (data.HKD) msg += '港幣匯率' + data.HKD + '\n';

    msg +=
      '更新時間:' + moment.utc(data.date).format('YYYY-MM-DD hh:mm') + '\n';
    msg += '供您参考';
    return msg;
  }

  /**
   * Query Currency.
   *
   * @param {Context} context context.
   * @param {Array} types Currency types.
   * @return {Promise}
   */
  async queryCurrency(context, types) {
    metrics.count('exchange-crawler.CrawlerBot', 1, {
      func: 'queryCurrency',
    });

    let record = await this.currency.getCurrency(context, 'BOT');
    if (!Object.keys(record).length) {
      return {text: '您好\n'};
    } else {
      let currency = {};
      context.logger.log('debug', 'currency record is found', record);

      currency.date = record.date;
      types.forEach((x) => {
        currency[x] = record[x];
      });

      let msg = this.getCurrencyMsg(currency);
      return {text: msg};
    }
  }
};

module.exports = CrawlerBot;
