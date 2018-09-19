const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    // income or expense
    type: { type: String, enum: ['income', 'expense'], default: 'expense' },
    price: { type: Number, required: true },
    note: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

entrySchema.set('toObject', { virtuals: true });

entrySchema.method('toGraph', function toGraph() {
  return JSON.parse(JSON.stringify(this));
});

module.exports = mongoose.model('Entry', entrySchema);
