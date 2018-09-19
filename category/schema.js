const Category = require('./model');
const Entry = require('../entry/model');

const categoryTypeDefs = `
    type Category {
        id: ID!
        name: String!
        type: String!
        entries: [Entry]
    }

    input CategoryFilterInput {
        limit: Int
    }

    input CategoryInput {
        name: String
        type: String
    }

    extend type Query {
      categories(filter: CategoryFilterInput): [Category]
      category(id: String!): Category
    }

    extend type Mutation {
        addCategory(input: CategoryInput!): Category
        editCategory(id: String!, input: CategoryInput!): Category
        deleteCategory(id: String): Category
    }
`;

const categoryResolvers = {
  Query: {
    categories: async (_, { filter = {} }) => {
      const categories = await Category.find({}, null, filter);
      return categories.map(category => category.toGraph());
    },

    category: async (_, { id }) => {
      const category = await Category.findById(id);
      return category.toGraph();
    },
  },

  Mutation: {
    addCategory: async (_, { input }) => {
      try {
        const category = await Category.create(input);
        return category.toGraph();
      } catch (error) {
        console.log('add category ---->', error);
        return error;
      }
    },
    editCategory: async (_, { id, input }) => {
      try {
        const category = await Category.findByIdAndUpdate(id, input);
        return category.toGraph();
      } catch (error) {
        console.log('edit category ---->', error);
        return error;
      }
    },
    deleteCategory: async (_, { id }) => {
      try {
        const category = await Category.findByIdAndRemove(id);
        return category ? category.toGraph() : null;
      } catch (error) {
        console.log('delete category ---->', error);
        return error;
      }
    },
  },

  Category: {
    async entries(category) {
      const entries = await Entry.find({ categoryId: category._id });
      return entries.map(entry => entry.toGraph());
    },
  },
};

module.exports = { categoryTypeDefs, categoryResolvers };
