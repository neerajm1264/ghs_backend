// routes/orders.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order"); // adjust path if needed

// Create a new order
router.post("/", async (req, res) => {
  try {
    const body = req.body || {};

    // Normalize products and ensure quantityType exists
    const products = (body.products || []).map((p) => ({
      name: p.name,
      size: p.size,
      price: Number(p.price) || 0,
      quantity: Number(p.quantity) || 1,
      quantityType: p.quantityType || "kg",
    }));

    const orderData = {
      id: body.id || `order_${Date.now()}`,
      products,
      totalAmount: Number(body.totalAmount) || 0,
      name: body.name,
      phone: body.phone,
      address: body.address,
      timestamp: body.timestamp || new Date().toISOString(),
      saleType: body.saleType || "cash",
      paidAmount: Number(body.paidAmount) || 0,
      creditAmount: Number(body.creditAmount) || 0,
      discount: Number(body.discount) || 0,
      delivery: Number(body.delivery) || 0,
      gstAmount: Number(body.gstAmount) || 0,
      ComissionAmount: Number(body.ComissionAmount) || 0,
    };

    const newOrder = new Order(orderData);
    const saved = await newOrder.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to create order", error });
  }
});

// Fetch all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ timestamp: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
});

// Test route for orders
router.get("/test", (req, res) => {
  res.status(200).send("Orders test route working");
});

// Delete an order by id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findOneAndDelete({ id });

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res
      .status(200)
      .json({ message: "Order deleted successfully", deletedOrder });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ message: "Failed to delete order", error });
  }
});

module.exports = router;
