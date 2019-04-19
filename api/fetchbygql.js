'use strict';

const Middleware = require('./middleware');
const Storage = require('../base/storage');
const Currency = require('../store/currency');
const Time = require('../basw/time');
const moment = require('moment');

const storage = new Storage();
const store = new Currency({
  storage: storage,
});
const time = new Time()

const { graphql, buildSchema } = require('graphql');

const schema = buildSchema(`
  enum Currency {
    JPY
    USD
    CNY
  }

  type History {
    Rate: Float!
    Date: String!
  }
  
  type Query {
    history(currency: Currency! , startDate: String!, endDate: String!): [History]!
  }
`);


module.main = Middleware.handle((context) => {
  let event = context.event;
  context.logger.log('info', 'api request', event);
  const resolvers = {
    history: function (args) {
      let startDate = args.startDate;
      let endDate = args.endDate;
      let currency = args.currency;
      let dates = time.getDatesBetween(startDate, endDate);
      let historyRate = await store.getHistoryByDates(
        Context, dates, bank);
      let currencyRate = [];
      historyRate.forEach((element) => {
        dailyRate = {}
        let timestamp = element.date;
        dailyRate.Date = moment(timestamp).format('YYYYMMDD');
        dailyRate.Rate = element.rate.currency;
        currencyRate.push(dailyRate)
      });
      return currencyRate;
    },
  };
  const result = graphql(schema, event.body, resolvers);
  return Promise.resolve({ statusCode: 200, body: JSON.stringify(result.data, null, 2) });
});
