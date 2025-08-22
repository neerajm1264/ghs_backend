const express = require('express');
const router = express.Router();
const Order = require('../models/order');

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { id, products, totalAmount, timestamp, name, phone, address, saleType, paidAmount , creditAmount , discount , delivery, gstAmount, ComissionAmount } = req.body;
    const newOrder = new Order({ id, products, totalAmount, timestamp, name, phone, address, saleType, paidAmount , creditAmount , discount , delivery, gstAmount, ComissionAmount });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error });
  }
});

// Fetch all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error });
  }
});

// Test route for orders
router.get('/test', (req, res) => {
    res.status(200).send('Orders test route working');
  });  
  
module.exports = router;

  // Delete an order
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deletedOrder = await Order.findOneAndDelete({ id });
  
      if (!deletedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      res.status(200).json({ message: 'Order deleted successfully', deletedOrder });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete order', error });
    }
  });
