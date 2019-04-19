const Time = require('../base/time');

describe('Time', function() {
    describe('#getDatesBetween()', function() {
        let sandbox;

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function() {
            sandbox.restore();
        });
        it('should get dates between start date and end date', function() {
            let context ='';
            expectData = ['20190222', '20190223', '20190224',
                '20190225', '20190226', '20190227', '20190228', '20190301'];
            let startDate = '20190222';
            let endDate = '20190301';

            return time
            .getDatesBetween(context, startDate, endDate)
            .then(function(dates) {
              expect(dates).to.equal(expectData);
              return Promise.resolve();
            });
        });
    });
});
