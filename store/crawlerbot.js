'use strict';

const moment = require('moment');
const Metrics = require('../base/metrics');
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
   * @param {String} plat Bot platform.
   * @return {Promise}
   */
  async getUsers(plat) {
    metrics.count('exchange-crawler.CrawlerBot', 1, {
      func: 'getUsers',
    });

    let path = 'Users/' + plat + '.json';
    let record = await this.storage.get('currencybucket', path);
    return record.Users;
  }

  /**
   * Put bot users.
   *
   * @param {String} plat Bot platform.
   * @param {Object} users Bot users.
   * @return {Promise}
   */
  async putUsers(plat, users) {
    metrics.count('exchange-crawler.CrawlerBot', 1, {
      func: 'putUsers',
    });

    let obj = {
      Users: users,
    };

    let path = 'Users/' + plat + '.json';
    await this.storage.put('currencybucket', path, obj);
    return {};
  }

  /**
   * Add bot user.
   *
   * @param {String} plat Bot platform.
   * @param {Object} user Bot user.
   * @return {Promise}
   */
  async addSubscribeUser(plat, user) {
    metrics.count('exchange-crawler.CrawlerBot', 1, {
      func: 'addSubscribeUser',
    });

    // FIXME this is not atomic operation, it may cause racing issue
    let users = await this.getUsers(plat);
    users.push(user);
    await this.putUsers(plat, users);
    return {text: '訂閱成功'};
  }

  /**
   * Delete bot user.
   *
   * @param {String} plat Bot platform.
   * @param {Object} user Bot user.
   * @return {Promise}
   */
  async delSubscribeUser(plat, user) {
    metrics.count('exchange-crawler.CrawlerBot', 1, {
      func: 'delSubscribeUser',
    });

    // FIXME this is not atomic operation, it may cause racing issue
    let users = await this.getUsers(plat);
    let idx = users.indexOf(user);
    if (idx !== -1) {
      users.splice(idx, 1);
    }

    await this.putUsers(plat, users);
    return {text: '取消訂閱成功'};
  }

  /**
   * Broadcase currency information to all users to assigned bot platform.
   *
   * @param {String} plat Bot platform.
   * @param {Object} currency currency object to broadcast.
   * @return {Promise}
   */
  async broadcastCurrency(plat, currency) {
    metrics.count('exchange-crawler.CrawlerBot', 1, {
      func: 'broadcastMessage',
    });

    let msg = this.getCurrencyMsg(currency);
    let users = await this.getUsers(plat);
    await this.bot.publish(plat, users, msg);
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
   * @param {Array} types Currency types.
   * @return {Promise}
   */
  async queryCurrency(types) {
    metrics.count('exchange-crawler.CrawlerBot', 1, {
      func: 'queryCurrency',
    });

    let record = await this.currency.getCurrency('BOT');
    if (!Object.keys(record).length) {
      return {text: '您好\n'};
    } else {
      let currency = {};
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
