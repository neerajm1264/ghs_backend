const express = require('express');
const CustomerData = require('../models/customerdata');
const router = express.Router();

// Create or update customer and update totals (idempotent per order id)
router.post('/', async (req, res) => {
  try {
    const {
      id,            // order id (should be unique for each order)
      timestamp,
      name,
      phone,
      address,
      email,
      paidAmount = 0,   // number
      creditAmount = 0, // number
      transactions,
    } = req.body;

    const phoneStr = String(phone || "").trim();
 

    // Find existing customer
    let customer = await CustomerData.findOne({ phone: phoneStr });

    // If no customer, create new with supplied totals and mark order processed
    if (!customer) {
      const newCustomer = new CustomerData({
        id,
        name,
        phone: phoneStr,
        address,
        email,
        timestamp: timestamp || new Date().toISOString(),
        totalCash: Number(paidAmount || 0),
        totalOwed: Number(creditAmount || 0),
        totalAmount: Number(paidAmount || 0) + Number(creditAmount || 0),
        transactions,
      });

      await newCustomer.save();
      return res.status(201).json({ message: 'Customer added', customer: newCustomer });
    }

    // If customer exists, check if order already processed
    // if (id && Array.isArray(customer.processedOrders) && customer.processedOrders.includes(String(id))) {
    //   return res.status(200).json({ message: 'Order already processed for this customer, no changes made.' });
    // }

    // Update customer details (name/address/email) if provided
    if (name) customer.name = name;
    if (address) customer.address = address;
    if (email) customer.email = email;

    // Increment totals
    customer.totalCash = (customer.totalCash || 0) + Number(paidAmount || 0);
    customer.totalOwed = (customer.totalOwed || 0) + Number(creditAmount || 0);
    customer.totalAmount = (customer.totalCash || 0) + (customer.totalOwed || 0);

    // Mark order as processed
    // if (id) {
    //   customer.processedOrders = customer.processedOrders || [];
    //   customer.processedOrders.push(String(id));
    // }

    await customer.save();
    return res.status(200).json({ message: 'Customer updated', customer });
  } catch (error) {
    console.error("Error saving/updating customer:", error);
    return res.status(500).json({ message: 'Failed to save customer', error });
  }
});

// Fetch all CustomerData
router.get('/', async (req, res) => {
  try {
    const customers = await CustomerData.find();
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customer data:", error);
    res.status(500).json({ message: 'Failed to fetch customer data', error });
  }
});

// Update customer by ID (add transaction: received/gave)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount } = req.body;

    const customer = await CustomerData.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (type === "gave") {
      // You gave money → customer owes you
      customer.totalOwed += amount;
    } 
    else if (type === "received") {
      // Customer paid you back → reduce owed
      customer.totalOwed -= amount;

      // Prevent negative owed
      if (customer.totalOwed < 0) {
        customer.totalOwed = 0;
      }

      // Track how much cash you received
      customer.totalCash += amount;
    }

    // Lifetime tracker (optional)
    customer.totalAmount = customer.totalCash + customer.totalOwed;

    // Optional: add to transaction history
    if (customer.transactions) {
      customer.transactions.push({ type, amount });
    }

    await customer.save();
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
