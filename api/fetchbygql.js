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

const resolvers = {
  history: (args) => gqlstore.historyCurrency.get(
    args.start, args.end, args.Currency),
};

module.exports.query = async (event) => {
  console.log(event);
  const result = await graphql(schema, event.body, resolvers);
  return {statusCode: 200, body: JSON.stringify(result.data, null, 2)};
};
