const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
  /* Your data */
    deleted: { type: Boolean, default: false },
		description: { type: String, required: true},
		price: { type: Number, required: true},
		qty: { type: Number, required: true},
		when: { type: Date, required: true},
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Expense', ExpenseSchema);
