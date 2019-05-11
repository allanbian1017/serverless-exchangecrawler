'use strict';

const moment = require('moment-timezone');
const Metrics = require('../base/metrics');
const metrics = new Metrics('crawlerbot');

const CrawlerBot = class {
  /**
   * Constructor for CrawlerBot object.
   *
   * @param {Object} options JSON configuration.
   * @param {Object} options.bot Bot object.
   * @param {Object} options.currency Currency object.
   * @param {Object} options.subscription Subscription object.
   */
  constructor(options) {
    this.bot = options.bot;
    this.currency = options.currency;
    this.subscription = options.subscription;
  }

  /**
   * Add bot user to subscription list.
   *
   * @param {Context} context context.
   * @param {String} plat Bot platform.
   * @param {String} userID Bot user id.
   * @return {Promise}
   */
  async addSubscribeUser(context, plat, userID) {
    metrics.count('exec', 1, {
      func: 'addSubscribeUser',
    });

    await this.subscription.addUser(context, plat, userID);
    return {text: '訂閱成功'};
  }

  /**
   * Remove bot user subscription.
   *
   * @param {Context} context context.
   * @param {String} plat Bot platform.
   * @param {String} userID Bot user id.
   * @return {Promise}
   */
  async removeSubscribeUser(context, plat, userID) {
    metrics.count('exec', 1, {
      func: 'removeSubscribeUser',
    });

    await this.subscription.removeUser(context, plat, userID);
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
    metrics.count('exec', 1, {
      func: 'broadcastCurrency',
    });

    context.logger.log('debug', 'broadcase currency', currency);
    let msg = this.getCurrencyMsg(currency);
    let users = await this.subscription.listUsers(context, plat);
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
      '更新時間:' +
      moment(data.date)
        .tz('Asia/Taipei')
        .format('YYYY-MM-DD hh:mm') +
      '\n';
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
    metrics.count('exec', 1, {
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
