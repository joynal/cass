const Entry = require('./model');
const Category = require('../category/model');

const entryTypeDefs = `
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

    input EntryFilterInput {
        limit: Int
    }

    extend type Query {
        entries(filter: EntryFilterInput): [Entry]
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
      const entries = await Entry.find({}, null, filter);
      return entries.map(entry => entry.toGraph());
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
        console.log('add entry ---->', error);
        return error;
      }
    },

    editEntry: async (_, { id, input }) => {
      try {
        const category = Category.findOne({ _id: input.categoryId });

        if (input.categoryId && category) {
          const entry = await Entry.findByIdAndUpdate(id, { ...input, type: category.type });
          return entry.toGraph();
        }

        return new Error('Category not found');
      } catch (error) {
        console.log('edit entry ---->', error);
        return error;
      }
    },

    deleteEntry: async (_, { id }) => {
      try {
        const entry = await Entry.findByIdAndRemove(id);
        return entry ? entry.toGraph() : null;
      } catch (error) {
        console.log('delete entry ---->', error);
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
