const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense'], default: 'expense' },
  },
  { timestamps: true },
);

/**
 * This property will ensure our virtuals (including "id")
 * are set on the user when we use it.
 */
categorySchema.set('toObject', { virtuals: true });

/**
 * This is a helper method which converts mongoose properties
 * from objects to strings, numbers, and booleans.
 * stringify and parse for removing context object reference
 */
categorySchema.method('toGraph', function toGraph() {
  return JSON.parse(JSON.stringify(this));
});

module.exports = mongoose.model('category', categorySchema);
