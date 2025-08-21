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
    } = req.body;

    const phoneStr = String(phone || "").trim();
    if (!phoneStr) {
      // You can change this if phone is optional in your flow
      return res.status(400).json({ message: 'Phone is required' });
    }

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

module.exports = router;
