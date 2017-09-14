const Currency = require('../lib/currency');
const HttpClient = require('../lib/httpclient');
const should = require('should');
const sinon = require('sinon');

describe('Currency', function() {
  const fixedBody = 
'幣別        匯率             現金        即期        遠期10天        遠期30天        遠期60天        遠期90天       遠期120天       遠期150天       遠期180天 匯率             現金        即期        遠期10天        遠期30天        遠期60天        遠期90天       遠期120天       遠期150天       遠期180天\n' +
'USD         本行買入     29.77000    30.07000        30.05700        30.03200        29.99200        29.94800        29.89800        29.85100        29.79400 本行賣出     30.31200    30.17000        30.16100        30.14400        30.10300        30.06000        30.01700        29.97600        29.93300\n' +
'CNY         本行買入      4.28200     4.35400         4.34810         4.33640         4.32010         4.30290         4.28440         4.26590         4.24750 本行賣出      4.44400     4.40400         4.40050         4.39340         4.38100         4.36760         4.35400         4.34050         4.32710\n';
  const fixedContentHeaders = 'attachment; filename="ExchangeRate@201705171607.txt"';
  var client;
  var currency;

  before(function() {
    client = new HttpClient();
    currency = new Currency({ client: client });
  });

  describe('#query()', function() {
    var sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    it('should get USD exchange rate information', function() {
      const expectUSD = 30.312;
      let fixedObj = { body: fixedBody, headers: {} };
      fixedObj.headers['content-disposition'] = fixedContentHeaders;
      
      sandbox.stub(client, 'get').withArgs('http://rate.bot.com.tw/xrt/fltxt/0/day').resolves(fixedObj);

      return currency.query({ types: ['USD'] })
        .then(function(data) {
          data.should.have.property('USD', expectUSD);
          return Promise.resolve();
        });
    });
  });
});
