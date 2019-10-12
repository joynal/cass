const mongoose = require('mongoose');
const { ApolloServer, gql } = require('apollo-server');
const { makeExecutableSchema } = require('graphql-tools');

const { mongodbUrl } = require('./config');
const { entryResolvers, entryTypeDefs } = require('./entry/schema');
const { categoryResolvers, categoryTypeDefs } = require('./category/schema');

mongoose.connect(mongodbUrl, { useNewUrlParser: true });

const rootTypeDefs = gql`
  type Query
  type Mutation
  schema {
    query: Query
    mutation: Mutation
  }
`;

const schema = makeExecutableSchema({
  typeDefs: [rootTypeDefs, entryTypeDefs, categoryTypeDefs],
  resolvers: {
    Query: {
      ...entryResolvers.Query,
      ...categoryResolvers.Query,
    },
    Mutation: {
      ...entryResolvers.Mutation,
      ...categoryResolvers.Mutation,
    },
    Entry: entryResolvers.Entry,
    Category: categoryResolvers.Category,
  },
});

const server = new ApolloServer({
  schema,
  formatError(error) {
    console.log('server error:', error);
    return error;
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
