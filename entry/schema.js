const { gql } = require('apollo-server');

const Entry = require('./model');
const Category = require('../category/model');

const entryTypeDefs = gql`
  type Entry {
    id: ID!
    price: Int!
    note: String
    date: String
    type: String
    categoryId: String
    category: Category
  }

  type Stat {
    inflow: Int
    outflow: Int
  }

  input Pagination {
    limit: Int
    offset: Int
  }

  extend type Query {
    entries(filter: Pagination): [Entry]
    entry(id: String!): Entry
    stats: Stat
  }

  input EntryInput {
    price: Int!
    note: String
    date: String
    categoryId: String!
  }

  extend type Mutation {
    addEntry(input: EntryInput!): Entry
    editEntry(id: String!, input: EntryInput!): Entry
    deleteEntry(id: String): Entry
  }
`;

const entryResolvers = {
  Query: {
    entries: async (_, { filter = {} }) => {
      const limit = filter.limit || 20;
      const offset = filter.offset || 0;

      const entries = await Entry.find()
        .limit(Number(limit))
        .skip(Number(offset))
        .sort({ createdAt: 'desc' });

      return entries.map((entry) => entry.toGraph());
    },

    entry: async (_, { id }) => {
      const entry = await Entry.findById(id);
      return entry.toGraph();
    },

    stats: async () => {
      let inflow = 0;
      let outflow = 0;

      const entries = await Entry.find();

      entries.forEach((entry) => {
        if (entry.type === 'income') {
          inflow += entry.price;
        } else {
          outflow += entry.price;
        }
      });

      return {
        inflow,
        outflow,
      };
    },
  },

  Mutation: {
    addEntry: async (_, { input }) => {
      try {
        const category = await Category.findOne({ _id: input.categoryId });

        if (category) {
          const entry = await Entry.create({ ...input, type: category.type });
          return entry.toGraph();
        }

        return new Error('Category not found');
      } catch (error) {
        console.error('add entry err:', error);
        return error;
      }
    },

    editEntry: async (_, { id, input }) => {
      try {
        const category = Category.findOne({ _id: input.categoryId });

        if (input.categoryId && category) {
          const entry = await Entry.findByIdAndUpdate(id, {
            ...input,
            type: category.type,
          });
          return entry.toGraph();
        }

        return new Error('Category not found');
      } catch (error) {
        console.error('edit entry err:', error);
        return error;
      }
    },

    deleteEntry: async (_, { id }) => {
      try {
        const entry = await Entry.findByIdAndRemove(id);
        return entry ? entry.toGraph() : null;
      } catch (error) {
        console.error('delete entry err:', error);
        return error;
      }
    },
  },

  Entry: {
    async category(entry) {
      if (entry.categoryId) {
        const category = await Category.findById(entry.categoryId);
        return category.toGraph();
      }
      return null;
    },
  },
};

module.exports = { entryTypeDefs, entryResolvers };
