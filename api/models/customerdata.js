const mongoose = require('mongoose');

const customerdataSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String },
  phone: { type: String, unique: true, index: true }, // store as string
  address: { type: String },
  email: { type: String },
  timestamp: { type: String, required: true },
  totalAmount: { type: Number, default: 0 },
  totalCash: { type: Number, default: 0 },
  totalOwed: { type: Number, default: 0 },

  // track orders already applied to totals to avoid double increment
  // processedOrders: { type: [String], default: [] },
});

const CustomerData = mongoose.model('customerdata', customerdataSchema);

module.exports = CustomerData;
