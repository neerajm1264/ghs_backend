const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["received", "gave"], required: true },
  amount: { type: Number, required: true },
  description: { type: String }, 
  date: { type: Date, default: Date.now },
});

const customerdataSchema = new mongoose.Schema({
  // id: { type: String, required: true },
  name: { type: String },
  phone: { type: String, unique: true, index: true }, // store as string
  address: { type: String },
  email: { type: String },
  timestamp: { type: String, required: true },
  totalAmount: { type: Number, default: 0 },
  totalCash: { type: Number, default: 0 },
  totalOwed: { type: Number, default: 0 },
  transactions: [transactionSchema],  
  lifetimeSale: { type: Number, default: 0 }, 
  receivedAmount: { type: Number, default: 0 },
});

const CustomerData = mongoose.model('customerdata', customerdataSchema);

module.exports = CustomerData;
