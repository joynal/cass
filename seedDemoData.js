const mongoose = require('mongoose');

const { mongodbUrl } = require('./config');
const { categories, entries } = require('./fixtures.json');
const Category = require('./category/model');
const Entry = require('./entry/model');

mongoose.connect(mongodbUrl, { useNewUrlParser: true });

(() => {
  try {
    categories.map(async (category) => {
      const update = await Category.create(category);
      console.log('category created ---->', update._id);
    });

    entries.map(async (entry) => {
      const update = await Entry.create(entry);
      console.log('entry created ---->', update._id);
    });
  } catch (err) {
    console.log('seed error ---->', err);
  }
})();
