const Time = require('../base/time');
const expect = require('chai').expect;
const sinon = require('sinon');
const logger = require('../base/logger');
const Context = require('../base/context');

describe('Time', function() {
    before(function() {
        context = new Context({logger: logger});
        time = new Time();
      });
    describe('#getDatesBetween()', function() {
        let sandbox;

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function() {
            sandbox.restore();
        });
        it('should get dates between start date and end date', function() {
            expectData = ['20190222', '20190223', '20190224',
                '20190225', '20190226', '20190227', '20190228', '20190301'];
            let startDate = '20190222';
            let endDate = '20190301';

            return time
              .getDatesBetween(context, startDate, endDate)
              .then(function(dates) {
                expect(dates).to.deep.equal(expectData);
                return Promise.resolve();
              });
        });
    });
});
