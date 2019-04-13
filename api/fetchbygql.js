'use strict';

const Middleware = require('./middleware');
const moment = require('moment');
const Storage = require('../base/storage');
const Currency = require('../store/currency');
const gqlstore = require('../store/gqlstore');

const storage = new Storage();
const store = new Currency({
  storage: storage,
});

const {graphql, buildSchema} = require('graphql');

const schema = buildSchema(`
  enum Currency {
      JP
      US
      CN
  }

  type History {
    Rate: Int!
    Date: Int!
  }
  
  type Query {
    history(Country: Currency! , Start: Int!, End: Int!): [History]!
  }
`);

/**
  * Get history by time interval.
  *
  * @param {Context} context context.
  * @param {String} start Date.
  * @param {String} end Date.
  * @param {String} bank Bank name.
  * @param {String} currency currency name.
  * @return {Promise}
  */
async function getHistoryByCurrency(start, end, bank, currency) {
  let historyRate = await getIntervalHistory(Context, start, end);
  let currencyRate = {};
  historyRate.forEach(element => {
    currencyRate.date = element.date
    currencyRate.rate = element.rate.currency
  });
  return currencyRate
}


const resolvers = {
  history: (args) => store.getHistoryByCurrency(
    args.start, args.end, args.Currency, ),
};

module.exports.query = Middleware.handle((context) => {
  console.log(event);
  const result = await graphql(schema, event.body, resolvers);
  return {statusCode: 200, body: JSON.stringify(result.data, null, 2)};
});
