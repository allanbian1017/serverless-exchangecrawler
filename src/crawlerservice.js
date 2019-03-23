'use strict';

const moment = require('moment');
const Metrics = require('../lib/metrics');

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
    this.metrics = new Metrics();
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
    let self = this;
    self.metrics.count('exchange-crawler.service', 1, {
      func: 'queryCurrency',
    });

    let record = await self.cache.get('BOT');
    if (!Object.keys(record).length) {
      return {text: '您好\n'};
    } else {
      let data = record.data;
      let currency = {};
      currency.date = data.date;
      types.forEach((x) => {
        currency[x] = data[x];
      });

      let msg = self.getCurrencyMsg(currency);
      return {text: msg};
    }
  }

  /**
   * Publish Events.
   *
   * @param {Object} events Crawler service events.
   * @return {Promise}
   */
  async publishEvents(events) {
    let self = this;
    self.metrics.count('exchange-crawler.service', 1, {
      func: 'publishEvents',
    });

    await Promise.all(
      events.map((x) =>
        self.bot.publish(self.getCurrencyMsg(JSON.parse(x.Message)))
      )
    );
    return {};
  }

  /**
   * Crawling Currency.
   *
   * @param {Array} types Currency types.
   * @return {Promise}
   */
  async crawlingCurrency(types) {
    let self = this;
    self.metrics.count('exchange-crawler.service', 1, {
      func: 'crawlingCurrency',
    });

    let curRec = await self.src.query({types: types});
    let cacheRec = await self.cache.get('BOT');

    if (Object.keys(cacheRec).length) {
      let cacheData = cacheRec.data;
      if (new Date(curRec.date) > new Date(cacheData.date)) {
        let dateStr = moment(curRec.date).format('YYYYMMDD');
        console.log(dateStr);
        await self.history.add('BOT', dateStr, curRec);
        await self.cache.put('BOT', curRec);
        await self.eventdispatcher.dispatchCurrencyChangedEvent(curRec);
        return {};
      }
    } else {
      let dateStr = moment(curRec.date).format('YYYYMMDD');
      await self.history.add('BOT', dateStr, curRec);
      await self.cache.put('BOT', curRec);
      await self.eventdispatcher.dispatchCurrencyChangedEvent(curRec);
      return {};
    }

    return {};
  }

  /**
   * Fetch Currency History.
   *
   * @param {Object} date History date.
   * @return {Promise}
   */
  async fetchHistory(date) {
    let self = this;
    self.metrics.count('exchange-crawler.service', 1, {
      func: 'fetchHistory',
    });

    let records = await self.history.get('BOT', date);
    return records;
  }

  /**
   * Add subscribe user.
   *
   * @param {String} plat Bot platform.
   * @param {String} userId User ID.
   * @return {Promise}
   */
  async addSubscribeUser(plat, userId) {
    let self = this;
    self.metrics.count('exchange-crawler.service', 1, {
      func: 'addSubscribeUser',
    });

    await self.botuser.add(plat, userId);
    return {text: '訂閱成功'};
  }

  /**
   * Delete subscribe user.
   *
   * @param {String} plat Bot platform.
   * @param {String} userId User ID.
   * @return {Promise}
   */
  async delSubscribeUser(plat, userId) {
    let self = this;
    self.metrics.count('exchange-crawler.service', 1, {
      func: 'delSubscribeUser',
    });

    await self.botuser.del(plat, userId);
    return {text: '取消訂閱成功'};
  }
};

module.exports = CrawlerService;
