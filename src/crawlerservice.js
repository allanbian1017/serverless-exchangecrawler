'use strict';

const moment = require('moment');

const CrawlerService = class {
  /**
   * Constructor for CrawlerService object.
   *
   * @param {Object} options JSON configuration.
   * @param {Object} options.src CurrencySource object.
   * @param {Object} options.bot CurrencyBot object.
   * @param {Object} options.cache CurrencyCache object.
   * @param {Object} options.history CurrencyHistory object.
   * @param {Object} options.eventdispatcher EventDispatcher object.
   * @param {Object} options.botuser BotUser object.
   * @param {Object} options.metrics serverless-datadog-metrics object.
   */
  constructor(options) {
    this.src = options.src;
    this.bot = options.bot;
    this.cache = options.cache;
    this.history = options.history;
    this.eventdispatcher = options.eventdispatcher;
    this.botuser = options.botuser;
    this.metrics = options.metrics;
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
  queryCurrency(types) {
    let self = this;
    self.metrics.count('exchange-crawler.service', 1, {
      func: 'queryCurrency',
    });

    return Promise.resolve()
      .then(function() {
        return self.cache.get('BOT');
      })
      .then(function(data) {
        if (!Object.keys(data).length) {
          return Promise.resolve({text: '您好\n'});
        } else {
          let result = {};
          result.date = data.data.date;
          types.forEach(function(x) {
            result[x] = data.data[x];
          });
          return Promise.resolve({text: self.getCurrencyMsg(result)});
        }
      });
  }

  /**
   * Publish Events.
   *
   * @param {Object} events Crawler service events.
   * @return {Promise}
   */
  publishEvents(events) {
    let self = this;
    self.metrics.count('exchange-crawler.service', 1, {
      func: 'publishEvents',
    });

    return Promise.resolve().then(function() {
      return Promise.all(
        events.map(function(x) {
          return self.bot.publish(self.getCurrencyMsg(JSON.parse(x.Message)));
        })
      );
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
    self.metrics.count('exchange-crawler.service', 1, {
      func: 'crawlingCurrency',
    });

    return Promise.resolve()
      .then(function() {
        return self.src.query({types: types});
      })
      .then(function(data) {
        let p = [];
        p.push(self.cache.get('BOT'));
        p.push(Promise.resolve(data));

        return Promise.all(p);
      })
      .then(function(data) {
        let last = data[0];
        let cur = data[1];
        let p = [];

        if (Object.keys(last).length) {
          last = last.data;
          if (new Date(cur.date) > new Date(last.date)) {
            p.push(
              self.history.add('BOT', moment(cur.date).format('YYYYMMDD'), cur)
            );
            p.push(self.cache.put('BOT', cur));
            p.push(self.eventdispatcher.dispatchCurrencyChangedEvent(cur));

            return Promise.all(p);
          }
        } else {
          p.push(
            self.history.add('BOT', moment(cur.date).format('YYYYMMDD'), cur)
          );
          p.push(self.cache.put('BOT', cur));
          p.push(self.eventdispatcher.dispatchCurrencyChangedEvent(cur));

          return Promise.all(p);
        }

        return Promise.resolve();
      });
  }

  /**
   * Fetch Currency History.
   *
   * @param {Object} date History date.
   * @return {Promise}
   */
  fetchHistory(date) {
    let self = this;
    self.metrics.count('exchange-crawler.service', 1, {
      func: 'fetchHistory',
    });

    return Promise.resolve().then(function() {
      return self.history.get('BOT', date);
    });
  }

  /**
   * Add subscribe user.
   *
   * @param {String} plat Bot platform.
   * @param {String} userId User ID.
   * @return {Promise}
   */
  addSubscribeUser(plat, userId) {
    let self = this;
    self.metrics.count('exchange-crawler.service', 1, {
      func: 'addSubscribeUser',
    });

    return Promise.resolve()
      .then(function() {
        return self.botuser.add(plat, userId);
      })
      .then(function() {
        return Promise.resolve({text: '訂閱成功'});
      });
  }

  /**
   * Delete subscribe user.
   *
   * @param {String} plat Bot platform.
   * @param {String} userId User ID.
   * @return {Promise}
   */
  delSubscribeUser(plat, userId) {
    let self = this;
    self.metrics.count('exchange-crawler.service', 1, {
      func: 'delSubscribeUser',
    });

    return Promise.resolve()
      .then(function() {
        return self.botuser.del(plat, userId);
      })
      .then(function() {
        return Promise.resolve({text: '取消訂閱成功'});
      });
  }
};

module.exports = CrawlerService;
