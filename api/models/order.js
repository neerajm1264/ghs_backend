const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  id: { type: String },
  products: [{ name: String, price: Number, quantity: Number, size: String, quantityType: String, }],
  totalAmount: { type: Number, required: true },
  name: { type: String },
  phone: { type: Number },
  address: { type: String },
  timestamp: { type: String, required: true },
  saleType: {
    type: String,
    enum: ["cash", "credit", "partial"],
    default: "cash",
  },
  paidAmount: { type: Number, default: 0 },
  creditAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  delivery: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  ComissionAmount: { type: Number, default: 0 },
  quantityType: { type: String, default: "kg" },
  balanceAmount: { type: Number,},
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
