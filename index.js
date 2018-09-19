const { ApolloServer } = require('apollo-server');
const { makeExecutableSchema } = require('graphql-tools');
const mongoose = require('mongoose');

const { entryResolvers, entryTypeDefs } = require('./entry/schema');
const { categoryResolvers, categoryTypeDefs } = require('./category/schema');

const { mongodbUrl } = require('./config');

mongoose.connect(mongodbUrl, { useNewUrlParser: true });

const rootTypeDefs = `
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
    console.log('server error ---->', error);
    return error;
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
