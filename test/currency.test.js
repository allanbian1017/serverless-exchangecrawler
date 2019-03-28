process.env.DATADOG_API_KEY = 'justfortest';

const logger = require('../base/logger');
const Context = require('../base/context');
const KV = require('../base/kv');
const Storage = require('../base/storage');
const Event = require('../base/event');
const HttpClient = require('../base/httpclient');
const Currency = require('../store/currency');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('Currency', function() {
  const fixedBody =
    '幣別        匯率             現金        即期        ' +
    '遠期10天        遠期30天        遠期60天        遠期90天       ' +
    '遠期120天       遠期150天       遠期180天 匯率             ' +
    '現金        即期        遠期10天        遠期30天        ' +
    '遠期60天        遠期90天       遠期120天       遠期150天       遠期180天\n' +
    'USD         本行買入     29.77000    30.07000        ' +
    '30.05700        30.03200        29.99200        29.94800        ' +
    '29.89800        29.85100        29.79400 本行賣出     30.31200    ' +
    '30.17000        30.16100        30.14400        30.10300        ' +
    '30.06000        30.01700        29.97600        29.93300\n' +
    'CNY         本行買入      4.28200     4.35400         4.34810         ' +
    '4.33640         4.32010         4.30290         4.28440         ' +
    '4.26590         4.24750 本行賣出      4.44400     4.40400         ' +
    '4.40050         4.39340         4.38100         4.36760         ' +
    '4.35400         4.34050         4.32710\n';
  const fixedContentHeaders =
    'attachment; ' + 'filename="ExchangeRate@201705171607.txt"';

  let kv;
  let storage;
  let event;
  let client;
  let store;
  let context;

  before(function() {
    context = new Context({logger: logger});
    kv = new KV();
    storage = new Storage();
    event = new Event();
    client = new HttpClient();
    store = new Currency({
      kv: kv,
      storage: storage,
      event: event,
      client: client,
      currencyChangedTopic: 'testTopic',
    });
  });

  describe('#crawlingCurrency()', function() {
    let sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should execute success without error', function() {
      const testBank = 'BOT';
      const testCachedObj = {
        data: {
          date: 1495007420000,
          USD: 30,
        },
      };
      const testHistory = {
        History: [],
      };
      const expectDate = '20170517';
      const path = 'History/' + testBank + '/' + expectDate + '.json';
      let fixedObj = {body: fixedBody, headers: {}};
      fixedObj.headers['content-disposition'] = fixedContentHeaders;

      sandbox
        .stub(client, 'get')
        .withArgs(context, 'http://rate.bot.com.tw/xrt/fltxt/0/day')
        .resolves(fixedObj)
        .withArgs()
        .rejects();
      sandbox
        .stub(kv, 'get')
        .withArgs(context, 'currency', 'BOT')
        .resolves(testCachedObj)
        .withArgs()
        .rejects();
      sandbox
        .stub(storage, 'get')
        .withArgs(context, 'currencybucket', path)
        .resolves(testHistory)
        .withArgs()
        .rejects();
      sandbox
        .mock(storage)
        .expects('put')
        .once()
        .withArgs(context, 'currencybucket', path, sinon.match.any);
      sandbox
        .mock(kv)
        .expects('put')
        .once()
        .withArgs(context, 'currency', 'BOT', sinon.match.any);
      sandbox
        .mock(event)
        .expects('publish')
        .once()
        .withArgs(context, 'testTopic', sinon.match.has('USD', 30.312));

      return store
        .crawlingCurrency(context, ['USD'])
        .then(function() {
          sandbox.verify();
          return Promise.resolve();
        })
        .catch(function(err) {
          return Promise.reject(err);
        });
    });
  });

  describe('#queryCurrency()', function() {
    let sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should get USD exchange rate information', function() {
      const expectUSD = 30.312;
      let fixedObj = {body: fixedBody, headers: {}};
      fixedObj.headers['content-disposition'] = fixedContentHeaders;

      sandbox
        .stub(client, 'get')
        .withArgs(context, 'http://rate.bot.com.tw/xrt/fltxt/0/day')
        .resolves(fixedObj)
        .withArgs()
        .rejects();

      return store
        .queryCurrency(context, 'BOT', ['USD'])
        .then(function(data) {
          expect(data).to.have.property('USD', expectUSD);
          return Promise.resolve();
        })
        .catch(function(err) {
          return Promise.reject(err);
        });
    });
  });

  describe('#getHistory()', function() {
    let sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should execute success without error', function() {
      const testDate = '20170920';
      const testBank = 'BOT';
      const testData = {
        History: [
          {
            Message: JSON.stringify({
              date: 1505829840000,
              USD: 30,
              JPY: 0.27,
              AUD: 22,
              CNY: 4.5,
            }),
          },
        ],
      };
      const expectData = [
        {
          Message: JSON.stringify({
            date: 1505829840000,
            USD: 30,
            JPY: 0.27,
            AUD: 22,
            CNY: 4.5,
          }),
        },
      ];
      const expectPath = 'History/' + testBank + '/' + testDate + '.json';

      sandbox
        .stub(storage, 'get')
        .withArgs(context, 'currencybucket', expectPath)
        .resolves(testData)
        .withArgs()
        .rejects();

      return store
        .getHistory(context, testBank, testDate)
        .then(function(data) {
          expect(data).to.deep.equal(expectData);
          return Promise.resolve();
        })
        .catch(function(err) {
          return Promise.reject(err);
        });
    });
  });
});
