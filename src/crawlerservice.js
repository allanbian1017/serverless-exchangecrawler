'use strict';

const moment = require('moment');

/**
 * Constructor for CrawlerService object.
 *
 * @param {Object} options JSON configuration.
 * @param {Object} options.src CurrencySource object.
 * @param {Object} options.bot CurrencyBot object.
 * @param {Object} options.history CurrencyHist object.
 */
const CrawlerService = class {
  constructor(options) {
    this.src = options.src;
    this.bot = options.bot;
    this.history = options.history;
  }

  /**
   * @api private
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

    msg += '更新時間:' + moment(data.date).format('YYYY-MM-DD hh:mm') + '\n';
    msg += '供您参考';
    return msg;
  }

  /**
   * Process Line Events.
   *
   * @param {Object} events Line bot events.
   * @return {Promise}
   */
  processLineEvents(events) {
    let self = this;

    return Promise.resolve()
      .then(function() {
        return self.history.get('BOT');
      })
      .then(function(data) {
        return self.bot.lineBotHandler(events, { default: self.getCurrencyMsg(data.data) });
      });
  }

  /**
   * Crawling Currency.
   *
   * @param {Array} types Currency types.
   * @return {Promise}
   */
  crawlingCurrency(types) {
    let self = this;

    return Promise.resolve()
      .then(function() {
        return self.src.query({ types: types });
      })
      .then(function(data) {
        let p = [];
        p.push(self.history.get('BOT'));
        p.push(Promise.resolve(data));

        return Promise.all(p);
      })
      .then(function(data) {
        let last = data[0].data;
        let cur = data[1];

        if (new Date(cur.date) > new Date(last.date)) {
          let p = [];
          p.push(self.history.put('BOT', cur));
          p.push(self.bot.lineBotPublish(self.getCurrencyMsg(cur)));

          return Promise.all(p);
        }

        return Promise.resolve();
      });
  }
};

module.exports = CrawlerService;
